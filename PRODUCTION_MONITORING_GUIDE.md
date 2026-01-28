# 🔒 POST-DEPLOYMENT SECURITY MONITORING GUIDE

## For Live Mainnet Operations

---

## WEEK 1: CRITICAL MONITORING

### Daily Checklist
- [ ] Check signing server logs for errors
  ```bash
  tail -f signing-server.log | grep -i "error\|warn\|failed"
  ```

- [ ] Verify transaction success rate
  ```
  Target: > 95% success
  Acceptable: > 90% success
  Alert threshold: < 85% success
  ```

- [ ] Monitor API response times
  ```
  Target: < 5 seconds average
  Alert: > 15 seconds average
  ```

- [ ] Check revenue split accuracy
  ```bash
  # For each transaction:
  - 15% goes to PROJECT_WALLET
  - 85% goes to PRIZE_POOL_WALLET
  # Verify on KleverScan
  ```

### Immediate Actions on Issues
1. Check server logs for root cause
2. Verify `.env` configuration
3. Test API endpoint connectivity
4. Check PRIVATE_KEY validity
5. Review recent code changes

---

## WEEK 1-2: VALIDATION TESTS

### Test Transaction Signing
```bash
# Send test transaction through signing server
node test-lottery-purchase.js

# Verify in logs:
✅ Transaction signed successfully
✅ Transaction broadcast to mainnet
✅ Hash returned correctly
```

### Test Revenue Split
```bash
# For first 10 transactions:
1. Check project wallet receives 15%
2. Check prize pool receives 85%
3. Verify amounts on KleverScan
4. No funds lost or duplicated
```

### Test API Fallback
```bash
# Temporarily disable primary API endpoint
# Verify server uses backup endpoint
# Confirm transactions still succeed
```

### Test Timeout Recovery
```bash
# Simulate slow network (slow API response)
# Verify server retries (max 3 times)
# Verify exponential backoff (1s, 2s, 3s)
# Confirm transaction eventually succeeds
```

---

## ONGOING: SECURITY MONITORING

### Daily (Automated)
- [ ] Monitor signing server uptime
  ```bash
  # Health check every 60 seconds
  curl -s http://localhost:3001/health | jq .
  ```

- [ ] Log rotation and cleanup
  ```bash
  # Keep last 7 days of logs
  # Compress older logs
  # Delete logs older than 30 days
  ```

- [ ] Database/state integrity
  ```bash
  # Verify transaction counts match records
  # Check for duplicate transactions
  # Validate prize pool calculations
  ```

### Weekly
- [ ] Review transaction logs
  - Success/failure breakdown
  - Average response times
  - Any unusual patterns

- [ ] Check API endpoint health
  - Primary: https://api.mainnet.klever.org
  - Backup: https://api.kleverscan.org
  - Response times and error rates

- [ ] Verify wallet balances
  ```bash
  # Check PROJECT_WALLET and PRIZE_POOL_WALLET
  # Ensure funds accumulating correctly
  # Verify no unexpected outflows
  ```

### Monthly
- [ ] Security review
  - Any failed authentication attempts
  - API rate limit incidents
  - Timeout occurrences

- [ ] Performance analysis
  - Transaction throughput
  - Peak load times
  - Resource utilization

- [ ] Backup verification
  - Test restore procedures
  - Verify data integrity
  - Update disaster recovery plan

---

## ALERTS & ESCALATION

### Critical Alerts (Immediate Action)
| Issue | Action | Contact |
|-------|--------|---------|
| Signing Server Down | Restart service, check logs | Development Team |
| Transaction Failing | Review logs, check API, verify key | Development Team |
| Revenue Split Wrong | Stop sales, audit wallets | Project Owner |
| Private Key Exposed | Rotate immediately, update git history | Security Lead |

### Warning Alerts (24-Hour Review)
| Issue | Action | Contact |
|-------|--------|---------|
| API Response > 15s | Check network, monitor trends | DevOps Team |
| Success Rate < 90% | Investigate failures, update timeout | Development Team |
| High Error Rate | Monitor closely, prepare rollback | Technical Lead |

### Info Alerts (Weekly Review)
| Issue | Action | Contact |
|-------|--------|---------|
| Minor timeouts | Log and monitor | Development Team |
| Occasional API errors | Track patterns | DevOps Team |
| Performance metrics | Baseline for comparison | Analytics |

---

## KEY METRICS TO TRACK

### Transaction Metrics
```
- Total transactions processed
- Successful transactions (%)
- Failed transactions (%)
- Average signing time (ms)
- Peak transactions per minute
```

### API Metrics
```
- API response time (ms)
- API success rate (%)
- Retry rate (%)
- Timeout count
- Rate limit hits
```

### Financial Metrics
```
- Total KLV collected
- Project wallet balance
- Prize pool balance
- Ticket sales count
- Free tickets claimed
```

### System Metrics
```
- Server uptime (%)
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network throughput (Mbps)
```

---

## INCIDENT RESPONSE PROCEDURES

### Transaction Failed
1. **Immediate (5 min)**
   - Stop accepting new transactions
   - Check signing server logs
   - Verify server is running

2. **Investigation (30 min)**
   - Review last 10 transactions
   - Check API endpoint status
   - Verify PRIVATE_KEY is valid
   - Check network connectivity

3. **Resolution**
   - Identify root cause
   - Fix issue (restart, config, etc.)
   - Resume transaction processing
   - Verify 5+ transactions succeed

### Revenue Split Incorrect
1. **Immediate (5 min)**
   - Stop accepting new transactions
   - Document discrepancy amount
   - Review recent transactions

2. **Investigation (1 hour)**
   - Audit wallet configurations
   - Check contract state
   - Verify transaction records
   - Calculate impact

3. **Resolution**
   - Correct wallet addresses if needed
   - Audit all affected transactions
   - Compensate if necessary
   - Implement additional validation

### Suspected Security Breach
1. **Immediate (Now)**
   - Stop signing server
   - Secure all private keys
   - Isolate affected systems

2. **Investigation (2 hours)**
   - Review access logs
   - Check git history
   - Audit wallet transactions
   - Identify scope of breach

3. **Resolution**
   - Rotate all keys
   - Update production keys
   - Force redeploy
   - Audit security practices

---

## MAINTENANCE SCHEDULE

### Daily
- [ ] Check signing server health
- [ ] Review error logs
- [ ] Verify API connectivity

### Weekly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Backup configuration
- [ ] Test recovery procedures

### Monthly
- [ ] Full security audit
- [ ] Performance review
- [ ] Backup verification
- [ ] Incident review

### Quarterly
- [ ] Penetration testing
- [ ] Code security review
- [ ] Infrastructure audit
- [ ] Disaster recovery drill

### Annually
- [ ] Key rotation
- [ ] Full security assessment
- [ ] Compliance review
- [ ] System upgrade

---

## LOGGING CONFIGURATION

### What to Log
```
✅ Transaction requests (receiver, amount, timestamp)
✅ Transaction results (hash, status, timestamp)
✅ API calls (endpoint, response time, status)
✅ Errors and retries (timestamp, reason, retry count)
✅ System events (startup, shutdown, config load)
✅ Revenue split calculations (amounts, wallets)
```

### What NOT to Log
```
❌ Private keys
❌ Mnemonics
❌ Secret API tokens
❌ Wallet addresses (except partial/truncated)
❌ User personal information
❌ Transaction amounts in sensitive contexts
```

### Log Retention
```
- Active logs: 7 days (local storage)
- Archived logs: 30 days (backup storage)
- Audit logs: 1 year (compliance)
- Delete older logs automatically
```

---

## SECURITY REMINDERS

### DO ✅
- [ ] Keep `.env` file secure and backed up
- [ ] Rotate keys annually (or when exposed)
- [ ] Monitor signing server logs daily
- [ ] Test recovery procedures regularly
- [ ] Update dependencies monthly
- [ ] Document all incidents
- [ ] Review security regularly

### DON'T ❌
- [ ] Commit `.env` to git
- [ ] Hardcode secrets anywhere
- [ ] Use exposed keys in production
- [ ] Skip security updates
- [ ] Ignore error logs
- [ ] Disable API timeouts
- [ ] Reduce retry protection

---

## CONTACTS & ESCALATION

### For Security Issues
- **Immediate:** Stop signing server, secure keys
- **Alert:** Security Lead (within 1 hour)
- **Disclosure:** Klever Labs (if external vulnerability)
- **Communication:** Keep stakeholders informed

### For Technical Issues
- **Critical:** Page on-call developer
- **High:** Notify technical lead
- **Medium:** Create issue ticket
- **Low:** Add to sprint backlog

### For Operations
- **Outage:** Alert DevOps team
- **Performance:** Review with operations
- **Maintenance:** Schedule during low usage
- **Updates:** Test in staging first

---

## COMPLIANCE & REGULATIONS

### KYC/AML Considerations
- Monitor transaction patterns
- Flag suspicious activity
- Maintain transaction records
- Report suspicious transactions if required

### Financial Reporting
- Track revenue accurately
- Document wallet transactions
- Prepare audit trail
- Maintain compliance records

### Data Protection
- Protect user wallet addresses
- Secure transaction records
- Implement data retention policy
- Comply with privacy laws

---

## ESCALATION MATRIX

| Severity | Response Time | Notification | Action |
|----------|---------------|--------------|--------|
| Critical | 15 minutes | Immediate | Stop operations if needed |
| High | 1 hour | Notify lead | Investigate actively |
| Medium | 4 hours | Create ticket | Schedule fix |
| Low | 24 hours | Document | Plan for next sprint |

---

**Document Version:** 1.0  
**Last Updated:** January 28, 2026  
**Status:** ✅ READY FOR PRODUCTION
