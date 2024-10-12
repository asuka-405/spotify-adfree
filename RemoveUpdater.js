const fs = require("fs");
const os = require("os");
const username = os.userInfo().username;

/**
 * Recursively deletes a directory and all its contents.
 * @param {string} directoryPath - The path to the directory to delete.
 */
function removeDirectoryRecursively(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        const files = fs.readdirSync(directoryPath);

        // Iterate over all files and directories in the current directory
        files.forEach((file) => {
            const filePath = `${directoryPath}/${file}`;

            if (fs.statSync(filePath).isDirectory()) {
                // Recursively delete subdirectories
                removeDirectoryRecursively(filePath);
            } else {
                // Delete files
                fs.unlinkSync(filePath);
            }
        });

        // Once all files and subdirectories are deleted, remove the empty directory
        fs.rmdirSync(directoryPath);
    }
}

// Example usage: Deletes the Spotify folder from the user's AppData
const spotifyDirectoryPath = `C:\\Users\\${username}\\AppData\\Local\\Spotify`;
removeDirectoryRecursively(spotifyDirectoryPath);
