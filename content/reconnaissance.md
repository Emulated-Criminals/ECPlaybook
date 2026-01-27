---
title: Reconnaissance
date: 2026-01-22
background: bg-[#64748B]
icon: searching.svg
tags:
  - hacking
  - reconnaissance
  - osint
  - red teaming
  - penetration testing
categories:
  - Tactics, Techniques, and Procedures
intro:
  A quick cheatsheet for reconnaissance and initial information gathering. Focused on passive and active discovery techniques commonly used during early-stage red team and penetration testing engagements.
plugins:
  - copyCode
---



## External Focused Recon

### DNS Recon

Resolve domain records and validates DNS functionality.
```bash
dig example.com  
```
Identify authoritative name servers for a domain.
```bash
dig NS example.com  
```

Retrieves mail server information, useful for email attack surface mapping.
```bash
dig MX example.com  
```

Attempt a DNS zone transfer to dump all DNS records if misconfigured.
```bash
dig AXFR example.com @ns1.example.com  
```

Perform basic DNS resolution using the system resolver.
```bash
nslookup example.com  
```

Quickly resolve DNS records with concise output.
```bash
host example.com  
```


### Subdomain Enumeration

Passively discover subdomains using known data sources.
```bash
subfinder -d example.com  
```

Actively enumerate subdomains using DNS brute force and scraping.
```bash
amass enum -d example.com  
```

Perform passive-only subdomain discovery to reduce noise.
```bash
amass enum -passive -d example.com  
```


### Web Recon (Fingerprinting)

Identify web technologies such as frameworks, CMS, and server software.
```bash
whatweb https://target  
```
Detect client- and server-side technologies used by a web application.
```bash
wappalyzer https://target  
```

Retrieve HTTP headers to inspect server behavior and security controls.
```bash
curl -I https://target  
```
Fetch web content while ignoring TLS certificate validation errors.
```bash
curl -k https://target  
```


### Web Content Discovery
Brute-force directories and files to uncover hidden web content.
```bash
gobuster dir -u https://target -w wordlist.txt  
```

Brute-force subdomains via DNS resolution.
```bash
gobuster dns -d example.com -w wordlist.txt  
```
Fast fuzzing of URL paths to discover hidden endpoints.
```bash
ffuf -u https://target/FUZZ -w wordlist.txt  
```

Fuzz subdomains to identify additional virtual hosts.
```bash
ffuf -u https://FUZZ.target -w wordlist.txt  
```

### OSINT – Domains and People
Retrieve domain registration data and ownership metadata.
```bash
whois example.com  
```

Collect emails, hosts, and subdomains from public sources.
```bash
theHarvester -d example.com -b all  
```

Identify corporate email address patterns and known emails.
`hunter.io`

Search certificate transparency logs for related subdomains.
`crt.sh `

### OSINT – Infrastructure

Find internet-facing systems associated with an organization.
`shodan search "org:ExampleCorp" `

Enumerate exposed services and certificates across the internet.
`censys search example.com `

Historical and current DNS intelligence.
`securitytrails.com`  

### Email Recon
Harvest email addresses associated with a domain.
```bash
theHarvester -d example.com -b email  
```

Reputation and risk indicators for email addresses.
`emailrep.io`

### Cloud Recon

Check if an S3 bucket is publicly accessible.
```bash
aws s3 ls s3://bucket-name  
```
Determine the identity and permissions of the current AWS credentials.
```bash
aws sts get-caller-identity  
```
List accessible Google Cloud projects for the authenticated account.
```bash
gcloud projects list  
```
Enumerates Azure subscriptions tied to the current credentials.
```bash
az account list  
```


### Screenshotting / Visual Recon

Automatically screenshot discovered web services for quick visual triage.
```bash
aquatone  
```

Capture a screenshot of a single web target.
```bash
gowitness scan single https://target  
```


## Internal Focused Recon

### Network Discovery

Discover live hosts on the local network by sending ARP requests; fast and noisy but very accurate on LANs.
```bash
arp-scan -l  
```

Perform ARP-based discovery across a subnet to identify active IPs and MAC addresses.
```bash
netdiscover -r 10.0.0.0/24  
```

Conduct a ping sweep to identify which hosts are alive without scanning ports.
```bash
nmap -sn 10.0.0.0/24  
```
Use ARP requests instead of ICMP for host discovery, effective on local networks.
```bash
nmap -PR -sn 10.0.0.0/24  
```

### NMAP Port and Service Scanning
Scan all 65,535 TCP ports and reports only open ones for full service coverage.
```bash
nmap -p- --open -T4 target  
```
Run default NSE scripts and performs service/version detection on open ports.
```bash
nmap -sC -sV target  
```
Perform a stealth SYN scan while skipping host discovery, useful when ICMP is blocked.
```bash
nmap -sS -Pn target  
```
Run vulnerability detection scripts against discovered services.
```bash
nmap --script vuln target  
```

Scan the most common UDP ports to identify exposed UDP services.
```bash
nmap -sU --top-ports 100 target  
```

### SMB Recon (Unauthenticated)
List SMB shares without authentication if anonymous access is allowed.
```bash
smbclient -L //target -N  
```

Enumerate users, shares, and domain info via SMB and RPC.
```bash
enum4linux target  
```
Query RPC services anonymously for user and domain information.
```bash
rpcclient -U "" target  
```


### SNMP Recon
Attempt to dump SNMP data using the default public community string.
```bash
snmpwalk -c public -v1 target  
```

Perform automated SNMP enumeration and configuration checks.
```bash
snmp-check target  
```

### Wireless Recon
Capture wireless traffic and identifies nearby access points and clients.
```bash
airodump-ng wlan0  
```
Detect WPS-enabled access points and their configuration.
```bash
wash -i wlan0  
```


## Notes

### Notes {.col-span-3}
Passive recon should be exhausted before active scanning when possible.  
Always record negative results, absence of exposure is still signal.
