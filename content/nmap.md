---
title: Nmap
date: 2025-06-17
background: bg-[#2AA35B]
iconSize: 40
tags:
  - network
  - scan
  - port
  - penetration testing
  - red teaming
categories:
  - Applications
intro: 
  A quick cheatsheet for common usage and examples of Network Mapper(NMap). Includes common switches, examples, and red team/penetration testing examples. 
plugins:
  - copyCode
  
---

## Getting Started


### Basic Usage : 

Scan a single IP
```nmap
nmap 192.168.10.1
```
Scan specific IPs
```nmap
nmap 192.168.1.1 192.168.2.1
```
Scan a range
```nmap
nmap 192.168.10.0/24 
```
or
```nmap
nmap 192.168.1.1-254
```

Scan targets from a file
```nmap
nmap -iL targets.txt
```
Scan targets not included in list
```nmap
nmap -exclude 192.168.1.1
```
### Common usage
 Scan while Assuming Target is live & Port version
```nmap
nmap -Pn -sV 192.168.10.1
```

Scan a target for OS and Port Information
```nmap
nmap -sV -O 192.168.10.1
```

Scan a target quickly for all ports w/Version and OS

```nmap
nmap -T5 -p- -O 10.10.20.22

```

Output a scan to a xml file
```nmap
nmap -sV -O 10.20.30.40 -oX xml.file
```

Run Service Detection & default scripts
```nmap
nmap -sV -sC 192.168.13.37
```

## Common Switches 

### Port Options : {.col-span-2}

| Options                  | Purpose                                                                       |
|:-------------------------|:------------------------------------------                                    |
| `-p #`                   | Scan a specific port                                                          |
| `-p 1-1023`              | scan a range of ports                                                         |
| `-F`                     | Fast Scan of 100 most common ports                                            |
| `-r`                     | scan ports in consecutive order                                               |
| `-top-ports #`           | Port scan the top x ports                                                     |
| `--max-rate 50`          | rate <= 50 packets/sec                                                        |
| `--min-rate 15`          | rate >= 15 packets/sec                                                        |
| `--min-parallelism 100`  | at least 100 probes in parallel                                               |
| `-p0-`                   | Leaving off end port in the range designation makes the scan go through to port 65535          |


### Scan Techniques
| SWITCH | DESCRIPTION |
| --- |  --- |
| `-sS` |  TCP SYN port scan (Default) |
| `-sT` |  TCP connect port scan (Default without root privilege) |
| `-sU` |  UDP port scan |
| `-sA` |  TCP ACK port scan |
| `-sW` | TCP Window port scan |
| `-sM` |  TCP Maimon port scan |

See: [Port Scanning](https://nmap.org/book/scan-methods.html)

### Host Discovery
| SWITCH | DESCRIPTION |
| --- | --- |
| `-sL` | No Scan. List targets only |
| `-sn` | Disable port scanning. Host discovery only. |
| `-Pn` | Disable host discovery. Port scan only. |
| `-PS` | TCP SYN discovery on port x. Port 80 by default |
| `-PA` | TCP ACK discovery on port x. Port 80 by default |
| `-PU` | UDP discovery on port x. Port 40125 by default |
| `-PR` | ARP discovery on local network |
| `-n` | Never do DNS resolution |

### Port Specification {.col-span-2}
| SWITCH | DESCRIPTION |
| --- | --- |
| `-p ##` | Port scan for port x |
| `-p #-#` | Port range |
| `-p U:#,T:#,#` | Port scan multiple TCP and UDP ports |
| `-p` | Port scan all ports |
| `-p http,https` | Port scan from service name |
| `-F` | Fast port scan (100 ports) |
| `-top-ports ###` | Port scan the top x ports |
| `-p-65535` | Leaving off initial port in range makes the scan start at port 1 |
| `-p0-` | Leaving off end port in range makes the scan go through to port 65535 |


### Service and Version Detection {.col-span-2}
| SWITCH | DESCRIPTION |
| --- | --- |
| `-sV` | Attempts to determine the version of the service running on port |
| `-sV -version-intensity` | Intensity level 0 to 9. Higher number increases possibility of correctness |
| `-sV -version-light` | Enable light mode. Lower possibility of correctness. Faster |
| `-sV -version-all` | Enable intensity level 9. Higher possibility of correctness. Slower |
| `-A` | Enables OS detection, version detection, script scanning, and traceroute |

See: [Services and App Version Detection](https://nmap.org/book/vscan.html)


### Timing Switches
| SWITCH | DESCRIPTION |
| --- | --- |
| `-T0` | Paranoid (0) Intrusion Detection System evasion |
| `-T1` | Sneaky (1) Intrusion Detection System evasion |
| `-T2` | Polite (2) slows down the scan to use less bandwidth and use less target machine resources |
| `-T3` | Normal (3) which is default speed |
| `-T4` | Aggressive (4) speeds scans; assumes you are on a reasonably fast and reliable network |
| `-T5` | Insane (5) speeds scan; assumes you are on an extraordinarily fast network |



### Details & Report

| Option            | Purpose                                |
|:------------------|:---------------------------------------|
| `--reason`        | explains how Nmap made its conclusion  |
| `-v`              | verbose                                |
| `-vv`             | very verbose                           |
| `-d`              | debugging                              |
| `-dd`             | more details for debugging             |
| `-oN <filename>`  | Normal output                          |
| `-oX <filename>`  | XML output                             |
| `-oG <filename>`  | `grep`-able output                     |
| `-oA <basename>`  | Output in all major formats            |


### OS Detection {.col-span-2}
| SWITCH | DESCRIPTION |
| --- | --- |
| `-O` | Remote OS detection using TCP/IP stack fingerprinting |
| `-O -osscan-limit` | If at least one open and one closed TCP port are not found it will not try OS detection against host |
| `-O -osscan-guess` | Makes Nmap guess more aggressively |
| `-O -max-os-tries` | Set the maximum number x of OS detection tries against a target |
| `-A` | Enables OS detection, version detection, script scanning, and traceroute |


See: [Remote OS Detection](https://nmap.org/book/osdetect.html)




### NSE Scripts {.col-span-2}
| SWITCH | DESCRIPTION |
| --- | --- |
| `-sC` | Scan with default NSE scripts. Considered useful for discovery and safe |
| `-script default` | Scan with default NSE scripts. Considered useful for discovery and safe |
| `-script=<script>` | Scan with a single script. Example `banner` |
| `-script=<script>*` | Scan with a wildcard. Example `http*` |
| `-script=<script>,<script>` | Scan with two scripts. Example `http` and `banner` |
| `-script "not intrusive"` | Scan default, but remove intrusive scripts |
| `-script-args` | NSE script with arguments |

See: [Script Enginer](https://nmap.org/book/nse.html)

### Output {.col-span-2}
| SWITCH | DESCRIPTION |
| --- | --- |
| `-oN normal.file` | Normal output to the file normal.file |
| `-oX xml.file` | XML output to the file xml.file |
| `-oG grep.file` | Grepable output to the file grep.file |
| `-oA results` | Output in the three major formats at once |
| `-oG -` | Grepable output to screen. `-oN -`, `-oX -` also usable |
| `-append-output` | Append a scan to a previous scan file |
| `-v` | Increase the verbosity level (use `-vv` or more for greater effect) |
| `-d` | Increase debugging level (use `-dd` or more for greater effect) |
| `-reason` | Display the reason a port is in a particular state, same output as `-vv` |
| `-open` | Only show open (or possibly open) ports |
| `-packet-trace` | Show all packets sent and received |
| `-iflist` | Shows the host interfaces and routes |
| `-resume` | Resume a scan |



## Red Team Focused Examples

### Firewall/IDS Evasion/Spoofing {.row-span-2}
Fragment into smaller IP packets. _Harder for packet filters_
```nmap
nmap 192.168.10.1 -f
```

Set MTU Offset size

```nmap
nmap 192.168.1.1 -mtu 32
```

Send scans from a spoofed IP
```nmap
nmap -D 192.168.1.101,192.168.1.102 192.168.1.1
# Broken down the command above is 
nmap -D decoy-ip1,decoy-ip2 remote-host-ip
```

Scan Host from Host
```nmap
#-e eth0 -Pn may be required
nmap -S www.microsoft.com www.facebook.com
```

Use specific source port
```nmap
nmap -g 53 192.168.1.1
```

Relay connections using a HTTP or Socks4 Proxy
```nmap
nmap -proxies http://192.168.1.1:8080 192.168.1.1
```

Append Random Data to sent packets 
```nmap
nmap -data-length 200 192.168.1.1
```

Spoof Mac
```nmap
# Argument can use set MAC or Prefix or Vendor Name
nmap --spoof-mac Cisco 192.168.10.1
``` 

See: [Subverting Firewalls & IDS](https://nmap.org/book/firewalls.html)

### Operation Usage Examples

Wait 5 minutes between probes
Fragment packet sto evade simple packet filters
Append random data to avoid signature detection
add additional delay between probes

```nmap
nmap -sS -T0 -f --data-length 64 --scan-delay 10s 192.168.1.10
```


Don't scan Sequentially
Don't retry aggressively
Look more like organic network traffic

```nmap
nmap -sS --randomize-hosts -iL targets.txt -T2 --max-retries 1
```






### Advanced Scan {.col-span-2}

| Options    | Protocol | Main Function     | Typical Use Case                               |
| ---------- | -------- | ----------------  | ---------------------------------------------- |
| `-PR -sn`  | **ARP**  | Scan              | Discovering devices on the local network (LAN) |
| `-PE -sn`  | **ICMP** | Echo Scan         | Checking if hosts are reachable (pinging)      |
| `-PP -sn`  | **ICMP** | Timestamp Scan    | Gathering device time info (less common)       |
| `-PM -sn`  | **ICMP** | Address Mask Scan | Determining subnet mask info from hosts        |
| `-PS -sn`  | **TCP**  | SYN Ping Scan     | Detecting open TCP ports and live hosts        |
| `-PA -sn ` | **TCP**  | ACK Ping Scan     | Identifying firewall rules and open ports      |
| `-PU -sn`  | **ICMP** | Ping Scan         | Finding hosts with open UDP services           |




##  Reading Output

### Port States {.col-span-3}
| State | Meaning |
| --- | --- |
| `Open` | A service is actively accepting connections on this port. This is your target—something is listening. |
| `Closed` | The port is accessible (no firewall blocking), but no service is listening. |
| `Filtered` | Nmap can't determine if the port is open because packet filtering (firewall, IPS, router ACL) is preventing probes from reaching it. You're not getting responses—you're getting silence. |
| `Unfiltered` | The port is accessible, but Nmap can't determine if it's open or closed. |
| `Open\|Filtered` | Nmap can't tell if the port is open or filtered. |
| `closed\|filtered` | Rare state, usually seen with IP ID idle scans. The port is either closed or filtered. |

### What it means {.col-span-3}

| State | Next Steps |
| --- | --- |
| `Open` | Potential attack vector - enumerate service |
| `Closed` | Nothing useful is running here. |
| `Filtered` | Try different scan types or evasion techniques to bypass the filter. |
| `Unfiltered` | You need a different scan type to determine if a service is running. |
| `Open\|Filtered` | Run service detection (`-sV`) or NSE scripts to probe deeper. |
| `Closed\|Filtered` | You can try a different scan type, but may not be helpful |


### Verbose Os Quick port scan {.col-span-3}

```bash
nmap -sV -O -p- -T5 target 
 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-11-02 15:17 CET

Nmap scan report for target (10.10.158.161)
Host is up (0.021s latency).
Not shown: 65532 closed tcp ports (reset)

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
8009/tcp open  ajp13   Apache Jserv (Protocol v1.3)
8080/tcp open  http    Apache Tomcat 8.5.5

Aggressive OS guesses: Linux 3.10 - 3.13 (95%), Linux 5.4 (95%), ASUS RT-N56U WAP (Linux 3.4) (95%),
Linux 3.16 (95%), Linux 3.1 (93%), Linux 3.2 (93%), AXIS 210A or 211 Network Camera (Linux 2.6.17) (93%), 
Sony Android TV (Android 5.0) (93%), Android 5.0 - 6.0.1 (Linux 3.4) (93%), Android 5.1 (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 39.94 seconds


# you can then use `nmap -A -p 22, 8009, 8080 target` on discovered ports
```
Do not use this tool without consent. For educational purposes, this example is coming from a Try Hack Me [machine](https://tryhackme.com/room/bsidesgtthompson).



## Also See

### resources 
- [Nmap](https://nmap.org/)