import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import { app } from './config';

/**
 * Firebase Analytics Utilities
 * This file provides a safe wrapper for Firebase Analytics functionality
 * with proper environment checks and fallbacks
 */

// Analytics instance
let analytics: Analytics | null = null;

/**
 * Initialize Firebase Analytics with proper environment checks
 * @returns Promise that resolves to true if analytics was initialized successfully
 */
export const initializeAnalytics = async (): Promise<boolean> => {
  try {
    // Check if analytics is supported in the current environment
    if (await isSupported()) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
      return true;
    } else {
      console.log('Firebase Analytics is not supported in this environment');
      return false;
    }
  } catch (error) {
    console.error('Analytics initialization error:', error);
    return false;
  }
};

/**
 * Log an analytics event safely
 * @param eventName Name of the event to log
 * @param eventParams Optional parameters for the event
 * @returns Promise that resolves to true if the event was logged successfully
 */
export const logAnalyticsEvent = async (
  eventName: string, 
  eventParams: Record<string, any> = {}
): Promise<boolean> => {
  try {
    // Initialize analytics if not already initialized
    if (!analytics) {
      const initialized = await initializeAnalytics();
      if (!initialized) {
        // Log to console as fallback
        console.log(`Analytics event (not sent): ${eventName}`, eventParams);
        return false;
      }
    }
    
    // Log the event
    await logEvent(analytics!, eventName, eventParams);
    return true;
  } catch (error) {
    console.error('Error logging analytics event:', error);
    // Log to console as fallback
    console.log(`Analytics event (not sent due to error): ${eventName}`, eventParams);
    return false;
  }
};

/**
 * Check if Firebase Analytics is available
 * @returns Promise that resolves to true if analytics is supported
 */
export const isAnalyticsAvailable = async (): Promise<boolean> => {
  try {
    return await isSupported();
  } catch (error) {
    console.error('Error checking analytics support:', error);
    return false;
  }
};

/**
 * Common analytics events
 */
export const AnalyticsEvents = {
  LOGIN: 'login',
  SIGN_UP: 'sign_up',
  SCREEN_VIEW: 'screen_view',
  SELECT_CONTENT: 'select_content',
  SHARE: 'share',
  SEARCH: 'search',
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_PAYMENT_INFO: 'add_payment_info',
  ADD_SHIPPING_INFO: 'add_shipping_info',
  VIEW_PROMOTION: 'view_promotion',
  SELECT_PROMOTION: 'select_promotion',
  VIEW_ITEM_LIST: 'view_item_list',
  ADD_TO_WISHLIST: 'add_to_wishlist',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_SEARCH_RESULTS: 'view_search_results',
  LEVEL_UP: 'level_up',
  POST_SCORE: 'post_score',
  TUTORIAL_BEGIN: 'tutorial_begin',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  EARN_VIRTUAL_CURRENCY: 'earn_virtual_currency',
  SPEND_VIRTUAL_CURRENCY: 'spend_virtual_currency',
  UNLOCK_ACHIEVEMENT: 'unlock_achievement',
  JOIN_GROUP: 'join_group',
  LEAVE_GROUP: 'leave_group',
  SELECT_ITEM: 'select_item',
  VIEW_CART: 'view_cart',
  EXCEPTION: 'exception',
};
