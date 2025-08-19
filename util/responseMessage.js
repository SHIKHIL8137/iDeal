const RESPONSE_MESSAGES = {
  // Success messages
  PRODUCT_UPDATED_IN_CART: 'Product updated in cart successfully.',
  CART_UPDATED_SUCCESSFULLY: 'Cart updated successfully.',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart successfully.',
  CHECKOUT_DATA_SAVED: 'Checkout data saved successfully.',
  CART_LOADED: 'Cart loaded successfully.',
  CART_DETAILS_FETCHED: 'Cart details fetched successfully.',

  // Error messages
  PRODUCT_ID_PRICE_REQUIRED: 'Product ID and price are required.',
  USER_NOT_LOGGED_IN: 'User is not logged in.',
  INVALID_PRODUCT_ID: 'Invalid product ID.',
  USER_NOT_FOUND: 'User not found.',
  CART_LIMIT_REACHED: 'Cart limit reached. You can only have 10 products in the cart.',
  MAX_QUANTITY_REACHED: 'Maximum quantity for a product is 10.',
  CART_NOT_FOUND: 'Cart not found.',
  PRODUCT_NOT_IN_CART: 'Product not found in cart.',
  PRODUCT_NOT_IN_INVENTORY: 'Product not found in the inventory.',
  MIN_QUANTITY_REACHED: 'Minimum quantity is 1.',
  INSUFFICIENT_STOCK: 'Insufficient stock available.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  CART_ITEMS_NOT_FOUND: 'Cart items not found.',
  RECORD_NOT_FOUND_FOR_UPDATE: 'Record not found for update.',

    ORDER_LOADED_SUCCESSFULLY: 'Order loaded successfully.',
  ORDER_DETAILS_FETCHED: 'Order details fetched successfully.',
  ORDER_CONFIRMATION_LOADED: 'Order confirmation loaded successfully.',
  ORDER_CANCELED_SUCCESSFULLY: 'Order canceled successfully.',
  ORDER_EXPIRED_SUCCESSFULLY: 'Order expired successfully.',
  RETURN_ORDER_INITIATED: 'Return order initiated successfully.',
  CANCEL_PRODUCT_ORDER_SUCCESSFULLY: 'Cancel Product Order successfully.',

  // Error messages
  USER_NOT_FOUND: 'User not found.',
  ORDER_ID_REQUIRED: 'Order ID is required.',
  ORDER_NOT_FOUND: 'Order not found.',
  ORDER_ALREADY_EXPIRED: 'Order is already expired.',
  WALLET_NOT_FOUND: 'Wallet not found.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  ALL_FIELDS_REQUIRED: 'All fields are required (reason, address, orderId, userId).',
  USER_NOT_LOGGED_IN: 'User not found.',


    // Success messages
  DATA_SAVED_SUCCESSFULLY: 'Data saved successfully!',
  PASSWORD_SET_SUCCESSFULLY: 'Password set successfully for the first time',
  PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully',
  NEW_ADDRESS_ADDED_SUCCESSFULLY: 'New address added successFully',
  ADDRESS_UPDATED_SUCCESSFULLY: 'Address updation SuccessFully',
  ADDRESS_DELETED_SUCCESSFULLY: 'Address deleted successfully',

  // Error messages
  EMAIL_REQUIRED: 'Email is required',
  NO_FIELDS_PROVIDED: 'No fields provided for update',
  USER_NOT_FOUND: 'User not found',
  NEW_PASSWORD_REQUIRED: 'New password is required',
  BOTH_PASSWORDS_REQUIRED: 'Both current and new passwords are required',
  CURRENT_PASSWORD_NOT_MATCH: 'The current password does not match',
  USER_ID_REQUIRED: 'User ID is required',
  MAX_ADDRESSES_REACHED: 'You can only store up to 5 addresses',
  INVALID_ADDRESS_ID: 'Invalid address ID',
  ADDRESS_NOT_FOUND: 'Address not found',
};

module.exports = RESPONSE_MESSAGES;