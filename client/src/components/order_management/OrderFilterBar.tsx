// search, date range, status filters, carrier filters, and export button for order data
import React from 'react';
import { ActionButton } from '../shared/ActionButton.js';
import { SectionLabel } from '../shared/SectionLabel.js';

/**
 * Types
 */
export type OrderFilterField =
    | 'status'
    | 'priority'
    | 'carrier'
    | 'assignee'
    | 'dateRange'
    | 'search';

export type OrderStatusFilter =
    | 'all'
    | 'pending'
    | 'allocated'
    | 'picking'
    | 'packing'
    | 'shipped'
    | 'delivered'
    | 'exception'
    | 'cancelled';

export type OrderPriorityFilter = 'all' | 'high' | 'medium' | 'low';