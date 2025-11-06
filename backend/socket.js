const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000,https://easycart-1-752r.onrender.com",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join admin room for admin-specific notifications
    socket.on('joinAdmin', () => {
      socket.join('admin');
      console.log('Admin joined:', socket.id);
    });

    // Leave admin room
    socket.on('leaveAdmin', () => {
      socket.leave('admin');
      console.log('Admin left:', socket.id);
    });

    // Customer support messages
    socket.on('message', (data) => {
      // Broadcast to support agents or handle message
      socket.emit('message', {
        text: `Thank you for your message: "${data.text}". Our team will respond shortly.`,
        sender: 'support',
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit product stock update to all connected clients
 */
const emitProductStockUpdate = (productData) => {
  if (io) {
    io.emit('productStockUpdate', productData);
    console.log('Product stock update emitted:', productData.productId);
  }
};

/**
 * Emit low stock alert to admin users
 */
const emitLowStockAlert = (productData) => {
  if (io) {
    io.to('admin').emit('lowStockAlert', {
      productId: productData.productId,
      productName: productData.name,
      stock: productData.stock,
      threshold: productData.lowStockThreshold,
      timestamp: new Date()
    });
    console.log('Low stock alert emitted:', productData.productId);
  }
};

/**
 * Emit product price update to all connected clients
 */
const emitProductPriceUpdate = (productData) => {
  if (io) {
    io.emit('productPriceUpdate', {
      productId: productData.productId,
      price: productData.price,
      comparePrice: productData.comparePrice,
      discountPercentage: productData.discountPercentage,
      timestamp: new Date()
    });
    console.log('Product price update emitted:', productData.productId);
  }
};

/**
 * Emit product update to all connected clients
 */
const emitProductUpdate = (action, productData) => {
  if (io) {
    io.emit('productUpdate', {
      action, // 'created', 'updated', 'deleted'
      product: productData,
      timestamp: new Date()
    });
    console.log(`Product ${action} emitted:`, productData._id);
  }
};

/**
 * Emit inventory alert to admin users
 */
const emitInventoryAlert = (alertData) => {
  if (io) {
    io.to('admin').emit('inventoryAlert', {
      ...alertData,
      timestamp: new Date()
    });
    console.log('Inventory alert emitted:', alertData.type);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitProductStockUpdate,
  emitLowStockAlert,
  emitProductPriceUpdate,
  emitProductUpdate,
  emitInventoryAlert
};
