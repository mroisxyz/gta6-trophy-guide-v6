Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$mid = [char]183
$d = Get-Content -Raw -Encoding UTF8 '.\app\data\trophies.json' | ConvertFrom-Json
$claims = @()
foreach ($t in $d.trophies) { $claims += @($t.steps); if ($t.checks) { $claims += @($t.checks) } }
$two = @($claims | Where-Object { @($_.cite).Count -ge 2 }).Count
$cited = @($claims | Where-Object { @($_.cite).Count -ge 1 }).Count
$sites = @($d.sources | Select-Object -ExpandProperty site -Unique).Count
$hidden = @($d.trophies | Where-Object { $_.hidden }).Count
$disputes = @($d.trophies | Where-Object { $_.disputes }).Count

$paper = [System.Drawing.Color]::FromArgb(244,236,217)
$paper2 = [System.Drawing.Color]::FromArgb(232,216,181)
$ink = [System.Drawing.Color]::FromArgb(33,28,21)
$muted = [System.Drawing.Color]::FromArgb(108,96,76)
$amber = [System.Drawing.Color]::FromArgb(179,73,15)
$red = [System.Drawing.Color]::FromArgb(156,47,29)
$rule = [System.Drawing.Color]::FromArgb(199,180,140)
$white = [System.Drawing.Color]::FromArgb(255,252,243)

function F($name,$size,$bold) {
  $style = [System.Drawing.FontStyle]::Regular
  if ($bold) { $style = [System.Drawing.FontStyle]::Bold }
  return New-Object System.Drawing.Font($name,[single]$size,$style,[System.Drawing.GraphicsUnit]::Pixel)
}
$fTitle = F 'Arial' 18 $true
$fSub = F 'Consolas' 8 $false
$fHead = F 'Arial' 12 $true
$fBody = F 'Arial' 9 $false
$fSmall = F 'Consolas' 8 $false
$fTiny = F 'Consolas' 7 $false
$bInk = New-Object System.Drawing.SolidBrush $ink
$bMuted = New-Object System.Drawing.SolidBrush $muted
$bAmber = New-Object System.Drawing.SolidBrush $amber
$bRed = New-Object System.Drawing.SolidBrush $red
$bWhite = New-Object System.Drawing.SolidBrush $white

function Box($g,$x,$y,$w,$h,$c) { $g.FillRectangle((New-Object System.Drawing.SolidBrush($c)),[single]$x,[single]$y,[single]$w,[single]$h) }
function Edg($g,$x,$y,$w,$h,$c) { $g.DrawRectangle((New-Object System.Drawing.Pen($c,1)),[single]$x,[single]$y,[single]$w,[single]$h) }
function T($g,$s,$x,$y,$font,$brush) { $g.DrawString([string]$s,$font,$brush,[single]$x,[single]$y) }
function Fit($g,$s,$w,$font) {
  $v = [string]$s
  if ($g.MeasureString($v,$font).Width -le $w) { return $v }
  while ($v.Length -gt 1 -and $g.MeasureString($v + '..',$font).Width -gt $w) { $v = $v.Substring(0,$v.Length-1) }
  return $v + '..'
}
function Wrap($g,$s,$w,$font) {
  $words = ([string]$s -split '\s+')
  $lines = @(); $cur = ''
  foreach ($word in $words) {
    $test = if ($cur) { $cur + ' ' + $word } else { $word }
    if ($g.MeasureString($test,$font).Width -gt $w -and $cur) { $lines += $cur; $cur = $word } else { $cur = $test }
  }
  if ($cur) { $lines += $cur }
  return $lines
}
function GradeChip($g,$grade,$x,$y) {
  $map = @{ platinum='P'; gold='G'; silver='S'; bronze='B' }
  $col = switch ($grade) { 'platinum' { [System.Drawing.Color]::FromArgb(66,92,120) } 'gold' { [System.Drawing.Color]::FromArgb(168,121,26) } 'silver' { [System.Drawing.Color]::FromArgb(115,119,124) } default { [System.Drawing.Color]::FromArgb(138,83,43) } }
  Box $g $x $y 14 14 $col
  T $g $map[$grade] ($x+4) ($y+1) $fTiny $bWhite
}
function Chrome($g,$view) {
  Box $g 0 0 1280 800 $paper
  Box $g 0 0 1280 62 $paper2
  Box $g 0 60 1280 2 $ink
  T $g 'LEONIDA LEDGER' 12 7 $fTitle $bInk
  T $g ('GTA VI / PS5 / CITATION-FIRST TROPHY AUDIT' + '  ' + $mid + '  ' + $d.list) 12 37 $fSub $bMuted
  T $g '0/55 earned   P0 G0 S0 B0' 700 13 $fHead $bAmber
  Box $g 890 10 106 26 $white; Edg $g 890 10 106 26 $rule; T $g 'Spoiler: OFF' 898 17 $fSmall $bInk
  Box $g 1002 10 74 26 $white; Edg $g 1002 10 74 26 $rule; T $g 'Export' 1015 17 $fSmall $bInk
  Box $g 1082 10 74 26 $white; Edg $g 1082 10 74 26 $rule; T $g 'Import' 1095 17 $fSmall $bInk
  T $g 'saved in this browser / localStorage' 1162 18 $fTiny $bMuted
  Box $g 0 62 1280 54 $paper2
  Box $g 8 66 38 18 $ink; T $g 'AUDIT' 12 68 $fTiny $bWhite
  $r1 = '55/55 official name' + $mid + 'description' + $mid + 'grade  |  1P 2G 6S 46B  |  ' + $hidden + ' PSN-hidden  |  ' + $cited + '/' + $claims.Count + ' claims cited  |  55/55 guides cite sources  |  ' + $two + ' backed by 2+ sources'
  $r2 = '' + $d.sources.Count + ' pages' + $mid + $sites + ' sites read 20 Nov 2026  |  1 possibly missable  |  8 at risk  |  3 unconfirmed  |  ' + $disputes + ' disputes shown both ways  |  offline snapshot'
  T $g $r1 52 67 $fSmall $bInk
  Box $g 8 91 42 18 $amber; T $g 'LEDGER' 12 93 $fTiny $bWhite
  T $g $r2 56 94 $fSmall $bInk
  Box $g 0 116 1280 31 $paper2
  Box $g 0 146 1280 1 $ink
  $x = 10
  foreach ($tab in @('Tracker','Roadmap','Missables','Sources')) {
    $active = $tab -eq $view
    if ($active) { Box $g $x 119 92 23 $ink; T $g $tab ($x+12) 123 $fHead $bWhite } else { T $g $tab ($x+12) 123 $fHead $bInk }
    $x += 100
  }
  T $g ('55 / 55 official  /  ' + $claims.Count + ' cited claims  /  ' + $disputes + ' disputes  /  no runtime network') 700 125 $fSmall $bMuted
  Box $g 0 780 1280 20 $paper2
  T $g 'LEONIDA LEDGER / compiled 20 Nov 2026 / 57 pages / 19 sites / source URLs are anchors only / no Rockstar artwork' 10 784 $fTiny $bMuted
}
function Rail($g) {
  Box $g 6 152 172 624 $paper2; Edg $g 6 152 172 624 $rule
  T $g 'FILTER THE LEDGER' 12 158 $fSmall $bAmber
  $filters = @(@('All',55),@('Story',12),@('Missable',9),@('Collectibles',7),@('Activities',23),@('Online',0),@('PSN-hidden',$hidden),@('Disputed',$disputes),@('Not earned',45))
  $y = 178
  foreach ($f in $filters) { T $g $f[0] 12 $y $fBody $bInk; T $g $f[1] 148 $y $fSmall $bMuted; $y += 17 }
  T $g 'GRADE CHIPS' 12 342 $fSmall $bAmber
  T $g 'P 1  G 2  S 6  B 46' 12 362 $fBody $bInk
  T $g 'SORT & SEARCH' 12 390 $fSmall $bAmber
  T $g 'roadmap order' 12 409 $fBody $bMuted
  Box $g 12 428 160 22 $white; Edg $g 12 428 160 22 $rule; T $g 'search name / description' 16 434 $fTiny $bMuted
}
function NextRail($g) {
  Box $g 1116 152 158 624 $paper2; Edg $g 1116 152 158 624 $rule
  T $g 'NEXT UP' 1122 158 $fSmall $bAmber
  T $g 'ROADMAP ORDER' 1122 173 $fSmall $bAmber
  $y = 194
  foreach ($t in @($d.trophies | Select-Object -First 10)) {
    T $g ('{0:d2}' -f $t.id) 1122 $y $fTiny $bMuted
    GradeChip $g $t.grade 1140 ($y-2)
    T $g (Fit $g $t.name 92 $fTiny) 1158 $y $fTiny $bInk
    T $g ('S'+$t.roadmapStage) 1260 $y $fTiny $bMuted
    $y += 29
  }
  T $g '15 manual saves' 1122 700 $fTiny $bMuted
  T $g 'cheats disable trophies' 1122 714 $fTiny $bMuted
}

# 1-cover: tracker with checklist, ledger detail, filters and next-up rail.
$bmp = New-Object System.Drawing.Bitmap 1280,800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear($paper)
Chrome $g 'Tracker'
Rail $g
NextRail $g
Box $g 184 152 360 624 $white; Edg $g 184 152 360 624 $rule
T $g 'CHECKLIST / 55 shown' 190 158 $fTiny $bMuted
T $g 'cites  hidden  window' 450 158 $fTiny $bMuted
$y = 178
foreach ($t in @($d.trophies | Select-Object -First 30)) {
  if ($t.id -eq 28) { Box $g 186 ($y-2) 356 22 ([System.Drawing.Color]::FromArgb(246,217,168)) }
  if ($t.missable) { Box $g 186 ($y-2) 3 22 $red }
  T $g ('[' + $(if ($t.id -eq 14) {'x'} else {' '}) + ']') 190 $y $fTiny $bMuted
  GradeChip $g $t.grade 208 ($y-3)
  T $g (Fit $g $t.name 156 $fTiny) 226 $y $fTiny $bInk
  T $g (Fit $g $t.description 62 $fTiny) 388 $y $fTiny $bMuted
  $cites = @($t.steps | ForEach-Object { @($_.cite).Count } | Measure-Object -Sum).Sum
  T $g $cites 492 $y $fTiny $bAmber
  if ($t.hidden) { T $g 'H' 510 $y $fTiny $bMuted }
  if ($t.missable) { T $g 'WIN' 524 $y $fTiny $bRed }
  $y += 20
}
$sel = @($d.trophies | Where-Object { $_.id -eq 28 })[0]
Box $g 550 152 560 624 $white; Edg $g 550 152 560 624 $rule
Box $g 556 158 54 16 $ink; T $g 'STAGE 1' 560 160 $fTiny $bWhite
GradeChip $g $sel.grade 616 158
T $g (Fit $g $sel.name 430 $fHead) 636 158 $fHead $bInk
Box $g 556 180 548 30 $paper2
T $g (Fit $g $sel.description 490 $fBody) 562 184 $fBody $bInk
T $g '[6] [8] [34]' 1050 185 $fTiny $bAmber
T $g 'BRONZE   PSN-hidden   18 tracked   POSSIBLY MISSABLE   SOURCES DIFFER' 556 216 $fTiny $bRed
Box $g 556 238 548 48 $paper2; Edg $g 556 238 548 48 $rule
T $g 'YOUR COUNT  7/18' 562 243 $fSmall $bAmber
T $g '39% / meditations' 1010 243 $fTiny $bMuted
Box $g 562 264 30 16 $white; Edg $g 562 264 30 16 $rule; T $g '-' 572 265 $fHead $bInk
Box $g 596 264 440 10 ([System.Drawing.Color]::FromArgb(223,209,177))
Box $g 596 264 171 10 $amber
Box $g 1040 264 30 16 $white; Edg $g 1040 264 30 16 $rule; T $g '+' 1049 265 $fHead $bInk
Box $g 556 294 548 26 ([System.Drawing.Color]::FromArgb(248,225,216))
T $g 'MISSABLE WINDOW  Chapter 1 balcony spot: do it before the chapter closes. [1][4][37]' 562 300 $fTiny $bRed
T $g 'SOURCES DIFFER - IS IT MISSABLE?' 556 330 $fSmall $bAmber
Box $g 556 350 548 52 $paper2; Edg $g 556 350 548 52 $rule
T $g (Fit $g 'A  PowerPyx calls Positive Mental Attitude possible-missable in Chapter 1. [1][2]' 536 $fTiny) 562 355 $fTiny $bInk
T $g (Fit $g 'B  BestGTA6 lists it among missables while other trackers treat spots revisitable. [4][34]' 536 $fTiny) 562 375 $fTiny $bInk
T $g 'UNCONFIRMED - kept open in the ledger' 562 391 $fTiny $bRed
T $g 'HOW TO EARN IT - 6 STEPS, EVERY ONE CITED' 556 416 $fSmall $bAmber
$y = 436
foreach ($s in $sel.steps) {
  T $g ('{0:d2}' -f ([array]::IndexOf($sel.steps,$s)+1)) 558 $y $fTiny $bAmber
  T $g (Fit $g $s.text 430 $fTiny) 580 $y $fTiny $bInk
  T $g ('[' + (@($s.cite) -join '][') + ']') 1018 $y $fTiny $bAmber
  $y += 19
}
T $g 'SOURCES FOR THIS GUIDE - 3' 556 566 $fSmall $bAmber
$y = 586
foreach ($s in $sel.sources) {
  T $g (Fit $g $s.name 240 $fTiny) 562 $y $fTiny $bInk
  T $g (Fit $g $s.url 260 $fTiny) 810 $y $fTiny $bMuted
  $y += 18
}
$bmp.Save('.\screenshots\1-cover.png',[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# 2-roadmap: five stage cards.
$bmp = New-Object System.Drawing.Bitmap 1280,800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear($paper); Chrome $g 'Roadmap'
T $g 'ONE PLAYTHROUGH - FIVE STAGES - NO NG+ - CHEATS OFF' 12 156 $fSmall $bAmber
$x = 8
$i = 0
foreach ($stage in $d.roadmap) {
  $i++
  Box $g $x 180 250 588 $white; Edg $g $x 180 250 588 $rule
  T $g ('0'+$stage.stage) ($x+10) 186 (F 'Consolas' 28 $false) $bMuted
  T $g (Fit $g $stage.name 226 $fHead) ($x+10) 226 $fHead $bInk
  T $g $stage.chapters ($x+10) 250 $fSmall $bAmber
  $lines = Wrap $g $stage.goal 226 $fBody
  $y = 272; foreach ($line in $lines) { T $g $line ($x+10) $y $fBody $bInk; $y += 14 }
  Box $g ($x+8) $y 234 44 $paper2
  T $g 'MANUAL SAVE' ($x+12) ($y+3) $fTiny $bAmber
  $sl = Wrap $g $stage.saves 222 $fTiny
  $yy = $y+17; foreach ($line in $sl) { T $g (Fit $g $line 220 $fTiny) ($x+12) $yy $fTiny $bInk; $yy += 11 }
  $y += 52
  if (@($stage.missables).Count -gt 0) {
    Box $g ($x+8) $y 234 40 ([System.Drawing.Color]::FromArgb(248,225,216))
    T $g 'WINDOW' ($x+12) ($y+3) $fTiny $bRed
    $ml = Wrap $g (@($stage.missables) -join ' / ') 220 $fTiny
    $yy = $y+17; foreach ($line in $ml) { T $g (Fit $g $line 220 $fTiny) ($x+12) $yy $fTiny $bInk; $yy += 11 }
    $y += 48
  }
  T $g 'TROPHIES IN STAGE' ($x+10) ($y+8) $fTiny $bMuted
  $tx = $x+10; $ty = $y+26
  foreach ($t in @($d.trophies | Where-Object { $_.roadmapStage -eq $stage.stage })) {
    GradeChip $g $t.grade $tx $ty
    $tx += 17; if ($tx -gt $x+220) { $tx = $x+10; $ty += 17 }
  }
  T $g ('[' + (@($stage.sources) -join '][') + ']') ($x+10) 752 $fTiny $bAmber
  $x += 252
}
$bmp.Save('.\screenshots\2-roadmap.png',[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# 3-missables: nine flagged cards.
$bmp = New-Object System.Drawing.Bitmap 1280,800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear($paper); Chrome $g 'Missables'
T $g '9 FLAGGED - 1 POSSIBLY MISSABLE - 8 AT RISK - 3 UNCONFIRMED' 12 156 $fSmall $bAmber
$x = 10; $y = 180; $n = 0
foreach ($t in @($d.trophies | Where-Object { $_.missable })) {
  $n++
  $unc = @($t.disputes | Where-Object { $_.unconfirmed }).Count -gt 0
  Box $g $x $y 414 190 $white; Edg $g $x $y 414 190 $(if ($unc) {$red} else {$rule})
  GradeChip $g $t.grade ($x+10) ($y+10)
  T $g (Fit $g $t.name 370 $fHead) ($x+30) ($y+8) $fHead $bInk
  T $g (Fit $g $t.description 390 $fBody) ($x+10) ($y+34) $fBody $bMuted
  Box $g ($x+8) ($y+62) 398 42 $paper2
  T $g 'WINDOW' ($x+14) ($y+66) $fTiny $bAmber
  $wl = Wrap $g $t.window 380 $fTiny
  $wy = $y+80; foreach ($line in $wl) { T $g (Fit $g $line 380 $fTiny) ($x+14) $wy $fTiny $bInk; $wy += 11 }
  T $g ('sources [' + (@($t.sources | ForEach-Object { $_.id }) -join '][') + ']') ($x+10) ($y+116) $fTiny $bAmber
  if ($unc) { T $g 'UNCONFIRMED - both positions shown in the detail pane' ($x+10) ($y+140) $fTiny $bRed } else { T $g 'save before the window closes - recheck on reload' ($x+10) ($y+140) $fTiny $bMuted }
  $x += 422
  if ($x -gt 840) { $x = 10; $y += 200 }
}
$bmp.Save('.\screenshots\3-missables.png',[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# 4-sources: register with the trophies each page supports.
$bmp = New-Object System.Drawing.Bitmap 1280,800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear($paper); Chrome $g 'Sources'
T $g '57 PAGES / 19 SITES / READ 20 NOV 2026 / ANCHORS ONLY' 12 156 $fSmall $bAmber
T $g '#   SITE                 PAGE / ANCHOR                                      USE                              SUPPORTS' 12 182 $fTiny $bAmber
$y = 198
foreach ($s in @($d.sources | Select-Object -First 40)) {
  $supports = @($d.trophies | Where-Object { @($_.sources | Where-Object { $_.id -eq $s.id }).Count -gt 0 } | ForEach-Object { $_.id })
  T $g ('{0:d2}' -f $s.id) 12 $y $fTiny $bMuted
  T $g (Fit $g $s.site 108 $fTiny) 34 $y $fTiny $bInk
  T $g (Fit $g $s.name 214 $fTiny) 148 $y $fTiny $bInk
  T $g (Fit $g $s.use 174 $fTiny) 370 $y $fTiny $bMuted
  T $g (Fit $g ($supports -join ' ') 300 $fTiny) 552 $y $fTiny $bAmber
  $g.DrawLine((New-Object System.Drawing.Pen($rule,1)),[single]10,[single]($y+13),[single]1265,[single]($y+13))
  $y += 15
}
$bmp.Save('.\screenshots\4-sources.png',[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host 'shots written'
