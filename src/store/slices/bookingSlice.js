import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Helper untuk API calls
const bookingAPI = {
  fetchAvailableBuses: (searchParams) => 
    api.post('/buses/search', searchParams),
  
  selectSeats: (seatsData) => 
    api.post('/booking/select-seats', seatsData),
  
  createBooking: (bookingData) => 
    api.post('/booking/create', bookingData),
  
  processPayment: (paymentData) => 
    api.post('/payment/process', paymentData),
  
  fetchBookingHistory: () => 
    api.get('/booking/history'),
  
  fetchBookingDetail: (bookingId) => 
    api.get(`/booking/${bookingId}`),
  
  cancelBooking: (bookingId, reason) => 
    api.put(`/booking/${bookingId}/cancel`, { reason }),
  
  downloadTicket: (bookingId) => 
    api.get(`/booking/${bookingId}/ticket`, { responseType: 'blob' }),
  
  checkSeatAvailability: (busId, seatNumbers) => 
    api.post(`/buses/${busId}/check-seats`, { seatNumbers }),
};

// Async Thunks dengan error handling yang konsisten
const createBookingThunk = (name, apiCall) => 
  createAsyncThunk(
    `booking/${name}`,
    async (data, { rejectWithValue }) => {
      try {
        const response = await apiCall(data);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Request failed. Please try again.';
        return rejectWithValue(errorMessage);
      }
    }
  );

export const fetchAvailableBuses = createBookingThunk(
  'fetchAvailableBuses', 
  bookingAPI.fetchAvailableBuses
);

export const selectSeats = createBookingThunk(
  'selectSeats', 
  bookingAPI.selectSeats
);

export const createBooking = createBookingThunk(
  'createBooking', 
  bookingAPI.createBooking
);

export const processPayment = createBookingThunk(
  'processPayment', 
  bookingAPI.processPayment
);

export const fetchBookingHistory = createBookingThunk(
  'fetchBookingHistory', 
  bookingAPI.fetchBookingHistory
);

export const fetchBookingDetail = createBookingThunk(
  'fetchBookingDetail', 
  (bookingId) => bookingAPI.fetchBookingDetail(bookingId)
);

export const cancelBooking = createBookingThunk(
  'cancelBooking', 
  ({ bookingId, reason }) => bookingAPI.cancelBooking(bookingId, reason)
);

export const downloadTicket = createAsyncThunk(
  'booking/downloadTicket',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.downloadTicket(bookingId);
      return { bookingId, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to download ticket';
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkSeatAvailability = createBookingThunk(
  'checkSeatAvailability', 
  ({ busId, seatNumbers }) => bookingAPI.checkSeatAvailability(busId, seatNumbers)
);

// Initial state yang lebih sederhana dan aman
const initialState = {
  // Search
  searchParams: {
    departure: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    passengers: 1,
    returnDate: null,
    tripType: 'one-way',
  },
  
  // Buses
  availableBuses: [],
  selectedBus: null,
  busLoading: false,
  busError: null,
  
  // Seats
  selectedSeats: [],
  seatMap: [],
  seatAvailability: [],
  seatLoading: false,
  seatError: null,
  
  // Passenger Info (tidak simpan data sensitif)
  passengerInfo: {
    mainPassenger: {
      name: '',
      email: '',
      phone: '',
    },
    additionalPassengers: [],
    pickupPoint: '',
    dropPoint: '',
    specialRequests: '',
  },
  
  // Booking (simpan minimal data)
  currentBooking: {
    id: null,
    bookingCode: '',
    status: 'draft',
    busId: null,
    seats: [],
    totalAmount: 0,
    paymentMethod: '',
    paymentStatus: 'pending',
    bookingDate: null,
  },
  
  // History
  bookingHistory: [],
  historyLoading: false,
  historyError: null,
  
  // Active booking
  activeBooking: null,
  bookingLoading: false,
  bookingError: null,
  
  // General state
  loading: false,
  error: null,
  success: false,
  lastUpdated: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    resetBookingState: () => initialState,
    
    updateSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    
    clearSearchResults: (state) => {
      state.availableBuses = [];
      state.selectedBus = null;
      state.busError = null;
    },
    
    selectBus: (state, action) => {
      state.selectedBus = action.payload;
      if (action.payload?.seatLayout) {
        state.seatMap = action.payload.seatLayout;
      }
    },
    
    toggleSeatSelection: (state, action) => {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex(s => s.number === seat.number);
      
      if (index === -1 && state.selectedSeats.length < state.searchParams.passengers) {
        state.selectedSeats.push({
          ...seat,
          passengerIndex: state.selectedSeats.length,
        });
      } else if (index !== -1) {
        state.selectedSeats.splice(index, 1);
        // Reassign indices
        state.selectedSeats.forEach((s, idx) => {
          s.passengerIndex = idx;
        });
      }
    },
    
    clearSeatSelection: (state) => {
      state.selectedSeats = [];
    },
    
    updatePassengerInfo: (state, action) => {
      state.passengerInfo = { ...state.passengerInfo, ...action.payload };
    },
    
    addAdditionalPassenger: (state) => {
      const newPassenger = {
        name: '',
        identityNumber: '',
        identityType: 'KTP',
        ageGroup: 'adult',
      };
      state.passengerInfo.additionalPassengers.push(newPassenger);
    },
    
    removeAdditionalPassenger: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.passengerInfo.additionalPassengers.length) {
        state.passengerInfo.additionalPassengers.splice(index, 1);
      }
    },
    
    updateAdditionalPassenger: (state, action) => {
      const { index, data } = action.payload;
      if (state.passengerInfo.additionalPassengers[index]) {
        state.passengerInfo.additionalPassengers[index] = {
          ...state.passengerInfo.additionalPassengers[index],
          ...data,
        };
      }
    },
    
    // Hapus paymentInfo dari Redux - simpan di local state component saja
    setCurrentBooking: (state, action) => {
      state.currentBooking = { ...state.currentBooking, ...action.payload };
    },
    
    clearCurrentBooking: (state) => {
      state.currentBooking = initialState.currentBooking;
      state.selectedSeats = [];
      state.selectedBus = null;
      state.passengerInfo = initialState.passengerInfo;
    },
    
    setActiveBooking: (state, action) => {
      state.activeBooking = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
      state.busError = null;
      state.seatError = null;
      state.historyError = null;
      state.bookingError = null;
    },
    
    clearSuccess: (state) => {
      state.success = false;
    },
    
    updateBookingStatus: (state, action) => {
      const { bookingId, status, paymentStatus } = action.payload;
      
      // Helper untuk update booking di berbagai tempat
      const updateBooking = (booking) => {
        if (booking.id === bookingId) {
          booking.status = status;
          if (paymentStatus) booking.paymentStatus = paymentStatus;
        }
      };
      
      updateBooking(state.currentBooking);
      updateBooking(state.activeBooking);
      
      state.bookingHistory = state.bookingHistory.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, ...(paymentStatus && { paymentStatus }) }
          : booking
      );
    },
  },
  extraReducers: (builder) => {
    const addDefaultCases = (thunk, loadingKey = 'loading', errorKey = 'error') => {
      builder
        .addCase(thunk.pending, (state) => {
          state[loadingKey] = true;
          state[errorKey] = null;
          state.success = false;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[loadingKey] = false;
          state.success = true;
          state.lastUpdated = new Date().toISOString();
        })
        .addCase(thunk.rejected, (state, action) => {
          state[loadingKey] = false;
          state[errorKey] = action.payload;
          state.success = false;
        });
    };
    
    // Fetch Available Buses
    builder
      .addCase(fetchAvailableBuses.pending, (state) => {
        state.busLoading = true;
        state.busError = null;
      })
      .addCase(fetchAvailableBuses.fulfilled, (state, action) => {
        state.busLoading = false;
        state.availableBuses = action.payload.buses || [];
      })
      .addCase(fetchAvailableBuses.rejected, (state, action) => {
        state.busLoading = false;
        state.busError = action.payload;
      });
    
    // Create Booking
    addDefaultCases(createBooking);
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.currentBooking = {
        ...state.currentBooking,
        ...action.payload.booking,
        bookingDate: new Date().toISOString(),
      };
      state.bookingHistory.unshift(action.payload.booking);
    });
    
    // Process Payment
    addDefaultCases(processPayment);
    builder.addCase(processPayment.fulfilled, (state) => {
      state.currentBooking.paymentStatus = 'paid';
      state.currentBooking.status = 'confirmed';
    });
    
    // Fetch Booking History
    builder
      .addCase(fetchBookingHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchBookingHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.bookingHistory = action.payload.bookings || [];
      })
      .addCase(fetchBookingHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      });
    
    // Fetch Booking Detail
    builder
      .addCase(fetchBookingDetail.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
      })
      .addCase(fetchBookingDetail.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.activeBooking = action.payload.booking;
      })
      .addCase(fetchBookingDetail.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      });
  },
});

export const {
  resetBookingState,
  updateSearchParams,
  clearSearchResults,
  selectBus,
  toggleSeatSelection,
  clearSeatSelection,
  updatePassengerInfo,
  addAdditionalPassenger,
  removeAdditionalPassenger,
  updateAdditionalPassenger,
  setCurrentBooking,
  clearCurrentBooking,
  setActiveBooking,
  clearError,
  clearSuccess,
  updateBookingStatus,
} = bookingSlice.actions;

export default bookingSlice.reducer;