#/bin/bash
eval cd js_sandbox && npm install . && npm test
r2=$?
exit $r2
