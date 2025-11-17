Add-Type -AssemblyName System.Drawing

$size = 1024
$outputDir = Join-Path $PSScriptRoot '..'
$outputPng = Join-Path $outputDir 'icon-generated.png'
$outputJpg = Join-Path $outputDir 'icon-generated.jpg'

$bitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))

$circleRect = New-Object System.Drawing.RectangleF -ArgumentList 40, 40, ($size - 80), ($size - 80)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList $circleRect, ([System.Drawing.ColorTranslator]::FromHtml('#3b82f6')), ([System.Drawing.ColorTranslator]::FromHtml('#1d4ed8')), 45.0
$graphics.FillEllipse($bgBrush, $circleRect)
$bgBrush.Dispose()

$strokePen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#60a5fa')), 20
$strokePen.Alignment = [System.Drawing.Drawing2D.PenAlignment]::Inset
$graphics.DrawEllipse($strokePen, $circleRect)
$strokePen.Dispose()

function Draw-RoundedBar {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [string]$StartColor,
        [string]$EndColor
    )

    $rect = New-Object System.Drawing.RectangleF -ArgumentList $X, $Y, $Width, $Height
    $radius = 60
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($rect.X, $rect.Y, $radius, $radius, 180, 90)
    $path.AddArc($rect.X + $rect.Width - $radius, $rect.Y, $radius, $radius, 270, 90)
    $path.AddArc($rect.X + $rect.Width - $radius, $rect.Y + $rect.Height - $radius, $radius, $radius, 0, 90)
    $path.AddArc($rect.X, $rect.Y + $rect.Height - $radius, $radius, $radius, 90, 90)
    $path.CloseFigure()

    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList $rect, ([System.Drawing.ColorTranslator]::FromHtml($StartColor)), ([System.Drawing.ColorTranslator]::FromHtml($EndColor)), 90.0
    $Graphics.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()
}

Draw-RoundedBar $graphics 260 420 120 400 '#10b981' '#059669'
Draw-RoundedBar $graphics 420 360 120 460 '#0ea5e9' '#0284c7'
Draw-RoundedBar $graphics 580 300 120 520 '#8b5cf6' '#7c3aed'
Draw-RoundedBar $graphics 740 460 120 360 '#f59e0b' '#d97706'

$dollarPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 40
$dollarPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$dollarPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($dollarPen, 512, 260, 512, 760)
$graphics.DrawLine($dollarPen, 440, 340, 584, 340)
$graphics.DrawLine($dollarPen, 440, 680, 584, 680)
$dollarPen.Dispose()

$graphics.Dispose()

$bitmap.Save($outputPng, [System.Drawing.Imaging.ImageFormat]::Png)

$jpgBitmap = New-Object System.Drawing.Bitmap $bitmap
$jpgBitmap.Save($outputJpg, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$jpgBitmap.Dispose()
$bitmap.Dispose()

Write-Output \"Generated files: $outputPng and $outputJpg\"
