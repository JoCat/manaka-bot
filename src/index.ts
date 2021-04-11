import "source-map-support/register"

import Core from "./core/Core"
import FileHelper from "./core/FileHelper"

FileHelper.createMissing()

export default new Core()
