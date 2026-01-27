---
title: Enumeration and Discovery
date: 2026-01-22
background: bg-[#22D3EE]

tags:
- hacking
- enumeration
- discovery
- red teaming
- penetration testing
categories:
- Tactics, Techniques, and Procedures
intro:  Cheatsheet for enumerating services, users, shares, and system details after initial access or network discovery.
plugins:
- copyCode
---

## External Focused Enumeration

### Web Enumeration {.col-span-2}

Enumerate directories and files exposed by a web application.
```bash
gobuster dir -u https://target -w wordlist.txt
```

Fuzz URL paths to identify hidden endpoints and parameters.
```bash
ffuf -u https://target/FUZZ -w wordlist.txt
```

Enumerate HTTP methods supported by a web server.
```bash
curl -X OPTIONS https://target
```

Identify application routes and behaviors by inspecting responses.
```bash
curl -s https://target | less
```

Enumerate API routes and versions.
```bash
ffuf -u https://api.target/FUZZ -w api.txt
```

Enumerate GraphQL schema via introspection.
```bash
curl -X POST https://target/graphql -d '{"query":"{__schema{types{name}}}"}'
```

### Authentication Enumeration
Enumerate exposed login endpoints and auth flows.
```bash
ffuf -u https://target/FUZZ -w auth.txt
```

Test for username enumeration via authentication responses.
```bash
hydra -L users.txt -p invalid target http-post-form
```

Enumerate OAuth / SSO endpoints and providers.
```bash
curl https://target/.well-known/openid-configuration
```

### Service Enumeration
Enumerate SMTP capabilities and authentication methods.
```bash
nmap -p 25,465,587 --script smtp-enum-users <target>
```

Enumerate SSH configuration and auth methods.
```bash
nmap -p 22 --script ssh-auth-methods,ssh2-enum-algos <target>
```

Enumerate RDP configuration and security level.
```bash
nmap -p 3389 --script rdp-enum-encryption,rdp-ntlm-info <target>
```

### Cloud Enumeration

Enumerate Azure blob containers.
```bash
az storage container list --account-name target
```

Enumerate exposed Google Cloud storage buckets.
```bash
gsutil ls gs://bucket-name
```

Enumerate public cloud storage permissions.
```bash
aws s3 ls s3://bucket-name
```


## Internal Focused Enumeration

### SMB Enumeration (Windows Focused)

Enumerate SMB users, shares, policies, and OS information.
```bash
enum4linux -a <target>
```

List available SMB shares without authentication.
```bash
smbclient -L //target -N
```

Enumerate SMB targets for users, shares, and permissions.
```bash
crackmapexec smb <target>
```

Enumerate SMB shares across a subnet.
```bash
crackmapexec smb 10.0.0.0/24 --shares
```

### LDAP / Active Directory Enumeration

Enumerate domain information anonymously if permitted.
```bash
ldapsearch -x -h <target>
```

Enumerate domain users, groups, and policies via LDAP.
```bash
crackmapexec ldap <target>
```

Collect comprehensive AD relationship data for graph analysis.
```bash
bloodhound-python -d domain.local -u user -p pass -c All
```

Enumerate domain users with valid credentials.
```bash
crackmapexec smb target -u user -p pass --users
```

### RPC Enumeration

Start an RPC client session (anonymous if permitted).
```bash
rpcclient -U "" target
```

List domain users through RPC calls (run inside rpcclient).
```bash
enumdomusers
```

List domain groups (inside rpcclient)
```bash
enumdomgroups
```


### Local Enumeration (Linux)

Identify kernel and OS version information.
```bash
uname -a
```

Display current user identity and group memberships.
```bash
id
```

List sudo privileges available to the current user.
```bash
sudo -l
```

Identify running processes and services.
```bash
ps aux
```

List listening services and open ports.
```bash
ss -lntup
```

Identify SUID binaries
```bash
find / -perm -4000 2>/dev/null
```

List system-wide cron jobs
```bash
ls -la /etc/cron*
```

Search for credentials in convifuration files
```bash
# Searches for the term password.
grep -Ri "password" /etc 2>/dev/null
```


### Local Enumeration Windows {.col-span-2} 

**Display detailed user, group, and privilege information.**
```cmd
whoami /all
```

**Enumerate local user accounts.**
CMD:
```cmd
net user
```

PowerShell:
```powershell
Get-LocalUser | Select Name,Enabled,LastLogon
```


**List members of the local administrators group.**
CMD:
```cmd
net localgroup administrators
```
PowerShell:
```powershell
Get-LocalGroupMember -Group "Administrators"
```

**Enumerate domain users.**
CMD:
```cmd
net user /domain
```

PowerShell:
```powershell
Get-ADUser -Filter *
```


**Display system information including patch level.**
```cmd
systeminfo
```


**Enumerate scheduled tasks.**
CMD:
```cmd
schtasks /query /fo LIST /v
```
PowerShell:
```powershell
# Identifies scheduled tasks running with elevatied Privs
Get-ScheduledTask | Where-Object { $_.Principal.RunLevel -eq "Highest" }
```

**Enumerate Services for path misconfiguration**
```cmd 
wmic service get name,displayname,pathname,startmode |findstr /i "auto" |findstr /i /v "c:\windows\\" |findstr /i /v """
```


## Notes

### Notes {.col-span-3}
Enumeration assumes intent and often credentials.
Expect higher signal and higher detection than recon.
This phase feeds directly into exploitation and lateral movement.