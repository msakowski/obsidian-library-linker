#!/bin/sh
# pre-push hook body (invoked via simple-git-hooks).
#
# Git feeds one line per ref on stdin: "<local_ref> <local_sha> <remote_ref> <remote_sha>".
# A branch deletion (`git push origin :branch`) has an all-zero <local_sha>, so there is
# nothing new to test — skip the suite in that case. Run the tests only when at least one
# ref actually pushes commits.

has_update=0
while read -r _local_ref local_sha _remote_ref _remote_sha; do
    case "$local_sha" in
        *[!0]*) has_update=1 ;; # any non-zero char => real update, not a deletion
    esac
done

if [ "$has_update" = "0" ]; then
    echo "[pre-push] Only branch deletions detected — skipping tests."
    exit 0
fi

pnpm test:affected
