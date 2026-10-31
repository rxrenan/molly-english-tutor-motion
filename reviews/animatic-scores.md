# animatic scores (540x960, crf 28)
| criterion | v1 | v2 (final) |
|---|---|---|
| hook | 7 (static 1.5-4s) | 8 (phone push-in at f64) |
| mobile legibility | 8 | 8 (chat bubbles small, captions carry) |
| motion | 7 (white flash in wipe f240-250; chatot dropped through footer on exit) | 8 |
| variety | 7 (lição/quiz/missão on screen ~0.7s) | 8 (chips from f440, ~1.3s) |
| sound sync | n/a (no audio) | n/a |
| brand | 9 | 9 |
fixes: 1) lesson screen stays mounted under the iphone-home wipe (no white flash). 2) chatot now exits to the right instead of falling through the footer. 3) hook gets a phone push-in at 2.1s; chips start 8 frames earlier and cascade faster.
loop: frame 0 vs 599 ssim 0.997 (same pose and screen, tiny residual spring offset).
determinism: frame 300 rendered twice, md5 f821d46b0bd4cebb6eb8d1a9bcbae20e both times.
