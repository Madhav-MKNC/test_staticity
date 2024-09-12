from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Base path to list items from ../../../
BASE_PATH = os.path.abspath('../../../')


@app.route('/get_list', methods=['GET'])
def get_list():
    # Get the current directory path from the request query (default is base path)
    current_path = request.args.get('path', '')

    # Join the base path with the requested path
    full_path = os.path.abspath(os.path.join(BASE_PATH, current_path))

    # Ensure the path is inside the base directory for security reasons
    if not full_path.startswith(BASE_PATH):
        return jsonify({'error': 'Invalid path'}), 400

    # Check if the directory exists
    if not os.path.exists(full_path):
        return jsonify({'error': 'Directory not found'}), 404

    # List all items (files and directories) in the directory
    try:
        items = os.listdir(full_path)
        item_data = []
        for item in items:
            item_full_path = os.path.join(full_path, item)
            is_directory = os.path.isdir(item_full_path)
            item_data.append({'name': item, 'is_directory': is_directory})
        return jsonify({'items': item_data, 'current_path': current_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='localhost', port=1234, debug=True)
