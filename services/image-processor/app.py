from flask import Flask, request, jsonify, send_file
from PIL import Image
import io
import os

app = Flask(__name__)

# Default values
DEFAULT_QUALITY = 82
DEFAULT_MAX_WIDTH = 1920
DEFAULT_STRIP_METADATA = True

# Hardening (internal-only service, still defence in depth):
# - reject oversized uploads before decoding (Flask returns 413);
# - cap decoded pixel count against decompression bombs (Pillow raises).
app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))
Image.MAX_IMAGE_PIXELS = 40_000_000

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'image-processor'})

@app.route('/convert', methods=['POST'])
def convert():
    """
    Convert uploaded image to WebP format.
    
    Form data:
    - file: The image file (required)
    - quality: WebP quality 1-100 (optional, default 82)
    - max_width: Maximum width in pixels (optional, default 1920)
    - strip_metadata: Remove EXIF data (optional, default true)
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    # Get optional parameters
    quality = request.form.get('quality', DEFAULT_QUALITY, type=int)
    max_width = request.form.get('max_width', DEFAULT_MAX_WIDTH, type=int)
    strip_metadata = request.form.get('strip_metadata', 'true').lower() == 'true'
    lossless = request.form.get('lossless', 'false').lower() == 'true'
    
    # Validate quality range
    quality = max(1, min(100, quality))
    
    try:
        # Open image with Pillow
        image = Image.open(file)
        
        # Ensure handling of transparency
        if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
            # If it's a palette image (P) with transparency, convert to RGBA to preserve it correctly during resize/processing
            if image.mode == 'P':
                image = image.convert('RGBA')
            # Keeping the alpha channel
        else:
            # For other modes, convert to RGB (standard for WebP without alpha)
            if image.mode != 'RGB':
                image = image.convert('RGB')
        
        # Resize if larger than max_width
        if image.width > max_width:
            ratio = max_width / image.width
            new_height = int(image.height * ratio)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Prepare output buffer
        output = io.BytesIO()
        
        # Save as WebP
        save_kwargs = {
            'format': 'WEBP',
            'quality': quality,
            'method': 4,  # Compression effort (0-6, 4 is balanced)
            'lossless': lossless
        }
        
        # Strip EXIF/Metadata if requested
        if strip_metadata:
            # Method 1: Save without 'exif' or 'icc_profile' params (Pillow default for WebP)
            # If we want to be absolutely sure, we can strip the info dict before saving
            image.info.pop('exif', None)
            image.info.pop('icc_profile', None)
            
        image.save(output, **save_kwargs)
        
        output.seek(0)

        # Return the WebP image. Expose the final (post-resize) dimensions as
        # headers so the caller can persist them without re-decoding the image.
        response = send_file(
            output,
            mimetype='image/webp',
            download_name='converted.webp'
        )
        response.headers['X-Image-Width'] = str(image.width)
        response.headers['X-Image-Height'] = str(image.height)
        return response

    except Exception:
        # Never echo internals to the caller; details go to the service logs.
        app.logger.exception('conversion failed')
        return jsonify({'error': 'conversion failed'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    app.run(host='0.0.0.0', port=port)
