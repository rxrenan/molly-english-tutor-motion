# animatic v2 (reference grammar) scores
| criterion | pass 1 | final |
|---|---|---|
| hook | 8 | 8 |
| mobile legibility (360px) | 8 | 8 (chat bubbles small; captions carry) |
| motion | 6 (bot teleported corner->top at 12.8s) | 8 |
| variety | 8 | 8 |
| sound sync | n/a | n/a |
| brand | 8 | 8 |
| fidelity to reference grammar | 7 (card never landed on the bot; captions overlapped mid-scroll) | 8 |
fixes: 1) bot pose is one continuous spring stack (island -> phone corner -> center), no teleport. 2) transcript card drops onto the bot (squash at f404), rides it to chatot, then chatot squashes on landing. 3) each caption set now does anticipation-dip + shoot-up exit, no overlap.
determinism: frame 300 rendered twice, md5 a2e5682e951c394d74df499759074503 both.
known: outro 17.5-20s is mostly static except the shake (f548-572); loop to frame 0 not attempted.
