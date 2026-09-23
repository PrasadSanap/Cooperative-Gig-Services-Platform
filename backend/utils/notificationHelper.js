const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  booking = null
}) => {
  try {
    if (!recipient) {
      console.error('Notification creation failed: recipient is required');
      return null;
    }

    if (!title || !message) {
      console.error(
        'Notification creation failed: title and message are required'
      );
      return null;
    }

    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      booking
    });

    return notification;
  } catch (error) {
    // Notification failure should not break the main booking operation
    console.error('Create notification error:', error);

    return null;
  }
};

module.exports = {
  createNotification
};