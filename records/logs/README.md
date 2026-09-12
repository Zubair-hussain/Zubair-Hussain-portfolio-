# Verification logs

Generated: 2026-09-12T09:54:25.633Z

| Check | Exit | Duration | Required |
| --- | ---: | ---: | --- |
| lint | 0 | 112.89s | yes |
| type-check | 0 | 18.52s | yes |
| unit-tests | 0 | 30.10s | yes |
| full-source-coverage | 1 | 36.99s | no |
| core-unit-coverage | 0 | 13.77s | yes |
| build | 0 | 108.44s | yes |
| production-dependency-audit | 0 | 3.63s | no |

Each adjacent `.log` file contains the command, timestamps, exit code, duration, stdout, and stderr. The full-source coverage and npm audit are informational: their findings remain visible without hiding the pass/fail state of the enforced checks.
