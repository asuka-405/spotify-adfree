const FS = require("fs")
const OS = require("os")
const USERNAME = OS.userInfo().username

function deleteDirectory(directoryPath) {
  if (FS.existsSync(directoryPath)) {
    const files = FS.readdirSync(directoryPath)

    files.forEach((file) => {
      const filePath = `${directoryPath}/${file}`

      if (FS.statSync(filePath).isDirectory()) {
        deleteDirectory(filePath)
      } else {
        FS.unlinkSync(filePath)
      }
    })

    // After deleting all files and subdirectories, delete the directory itself
    FS.rmdirSync(directoryPath)
  }
}

// Example usage:
deleteDirectory("C:\\Users\\" + USERNAME + "\\AppData\\Local\\Spotify")
