# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not** open a public GitHub issue.

Instead, please report it privately by emailing: **security@amerilendloan.com**

Please include:
- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested fixes (optional)

We will acknowledge receipt within **48 hours** and aim to provide a fix within **7 days** for critical issues.

## Security Best Practices

- All secrets and credentials must be stored as environment variables — never committed to the repository.
- See `.env.example` for the list of required environment variables.
- The application uses HTTPS in production; do not disable TLS/SSL verification in any environment.
