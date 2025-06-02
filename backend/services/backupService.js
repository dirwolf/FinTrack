const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Function to generate a timestamp for backup naming
const getFormattedTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

const backupDatabase = async () => {
  try {
    const dbPath = path.join(__dirname, '../database/database.sqlite');
    const backupDir = path.join(__dirname, '../backups');

    if (!fs.existsSync(dbPath)) {
      logger.error('Database file does not exist.', { dbPath });
      return { success: false, message: 'Database file does not exist.' };
    }

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info('Created backups directory.', { backupDir });
    }

    const timestamp = getFormattedTimestamp();
    const backupPath = path.join(backupDir, `kuber_${timestamp}.db`);

    fs.copyFileSync(dbPath, backupPath);
    fs.chmodSync(backupPath, 0o666); // Ensure the backup file is writable
    logger.info('Database backup created successfully.', { backupPath });

    return {
      success: true,
      message: 'Database backup created successfully.',
      backupFile: `kuber_${timestamp}.db`,
      backupPath,
    };
  } catch (err) {
    logger.error('Error during database backup:', { error: err.message, stack: err.stack });
    return { success: false, message: `Error during database backup: ${err.message}` };
  }
};

const restoreDatabase = async (backupData) => {
  try {
    if (!backupData.tempFilePath) {
      logger.error('Invalid backup file provided.');
      return { success: false, message: 'Invalid backup file provided' };
    }

    const backupFile = backupData.tempFilePath;
    const dbPath = path.join(__dirname, '../database/database.sqlite');
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      logger.info('Created database directory.', { dbDir });
    }

    const timestamp = getFormattedTimestamp();
    const autoBackupPath = path.join(path.dirname(dbPath), `pre_restore_${timestamp}.db`);
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, autoBackupPath);
      logger.info('Created automatic backup before restore.', { autoBackupPath });
    }

    fs.copyFileSync(backupFile, dbPath);
    fs.chmodSync(dbPath, 0o666);
    logger.info('Database restored successfully.', { dbPath });

    return { success: true, message: 'Database restored successfully.' };
  } catch (err) {
    logger.error('Error during database restore:', { error: err.message, stack: err.stack });
    return { success: false, message: `Error during database restore: ${err.message}` };
  }
};

module.exports = { backupDatabase, restoreDatabase };