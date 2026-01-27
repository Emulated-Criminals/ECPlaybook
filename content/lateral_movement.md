---
title: Lateral Movement
date: 2026-01-22
background: bg-[#F59E0B]
tags:
  - lateral movement
  - red teaming
  - penetration testing
categories:
  - Tactics, Techniques, and Procedures
intro:
  Methods used to move between systems inside a compromised environment.
plugins:
  - copyCode
---

## SMB / PSExec

psexec.py domain/user:pass@target  
crackmapexec smb targets -u user -p pass --exec-method smbexec  

## WinRM

evil-winrm -i target -u user -p pass  

## RDP

xfreerdp /u:user /p:pass /v:target  

## SSH

ssh user@target  
ssh -i key user@target
