## Summary
- What changed?
- Why is this safe?

## Validation
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm test -- --coverage`
- [ ] Docker image builds locally
- [ ] Trivy scan reviewed

## Deployment Risk
- [ ] No database migration
- [ ] Database migration included and rollback noted
- [ ] Environment variables documented

## Screenshots / Evidence
Attach UI screenshots, Grafana panels, Jenkins build links, or SonarQube quality gate evidence.

## Branch Protection Recommendation
Merge only after Jenkins succeeds, SonarQube quality gate passes, Trivy finds no HIGH/CRITICAL issues, and at least one reviewer approves.
