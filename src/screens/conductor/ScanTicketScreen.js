import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { conductorService } from '../../services/conductorService';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

export default function ScanTicketScreen({ route, navigation }) {
  const { scheduleId } = route.params;
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [flashMode, setFlashMode] = useState(false);
  
  // Vision Camera setup
  const devices = useCameraDevices();
  const device = devices.back;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0 && !scanned) {
        const ticketCode = codes[0].value;
        await handleTicketScan(ticketCode);
      }
    },
  });

  const handleTicketScan = async (ticketCode) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      const response = await conductorService.scanTicket(ticketCode);
      setScanResult(response.data);
      
      Alert.alert(
        'Ticket Scanned Successfully',
        `Passenger: ${response.data.passenger_name}\nSeat: ${response.data.seat_number}\nStatus: ${response.data.status}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setTimeout(() => {
                setScanned(false);
                setScanResult(null);
              }, 2000);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Scan Failed',
        error.response?.data?.message || 'Invalid ticket or already used',
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              setScanned(false);
              setScanResult(null);
            }
          }
        ]
      );
    }
  };

  const toggleFlash = () => {
    setFlashMode(!flashMode);
  };

  const renderScanResult = () => {
    if (!scanResult) return null;

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultCard}>
          <Icon name="check-circle" size={60} color="#4CAF50" />
          <Text style={styles.resultTitle}>Valid Ticket</Text>
          
          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Passenger:</Text>
              <Text style={styles.resultValue}>{scanResult.passenger_name}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Seat Number:</Text>
              <Text style={styles.resultValue}>{scanResult.seat_number}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Ticket Code:</Text>
              <Text style={styles.resultValue}>{scanResult.ticket_code}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Status:</Text>
              <Text style={[
                styles.resultValue,
                scanResult.status === 'checked_in' ? styles.statusChecked : styles.statusPending,
              ]}>
                {scanResult.status === 'checked_in' ? 'Already Checked In' : 'Checked In Successfully'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Permissions check
  useEffect(() => {
    const checkCameraPermission = async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      if (cameraPermission !== 'authorized') {
        const newCameraPermission = await Camera.requestCameraPermission();
        if (newCameraPermission !== 'authorized') {
          Alert.alert('Permission required', 'Camera permission is required to scan tickets');
        }
      }
    };
    
    checkCameraPermission();
  }, []);

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Ticket</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Ticket</Text>
        <TouchableOpacity onPress={toggleFlash}>
          <Icon 
            name={flashMode ? "flash-on" : "flash-off"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
          torch={flashMode ? 'on' : 'off'}
        />
        
        {/* Overlay with instructions and frame */}
        <View style={styles.overlayContainer}>
          <View style={styles.instructions}>
            <Icon name="qr-code-scanner" size={40} color="#FFFFFF" />
            <Text style={styles.instructionText}>
              Scan passenger's ticket QR code
            </Text>
            <Text style={styles.instructionSubtext}>
              Position the QR code within the frame
            </Text>
          </View>
          
          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          {/* Manual Input Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.manualButton}
              onPress={() => {
                // Navigate to manual input screen
                // navigation.navigate('ManualInputScreen', { scheduleId });
              }}
            >
              <Text style={styles.manualButtonText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scan Result */}
      {renderScanResult()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  instructions: {
    alignItems: 'center',
    paddingTop: 50,
  },
  instructionText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 15,
    fontWeight: '600',
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#1E88E5',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomContainer: {
    paddingBottom: 50,
  },
  manualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  resultCard: {
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
  },
  resultDetails: {
    width: '100%',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusChecked: {
    color: '#4CAF50',
  },
  statusPending: {
    color: '#1E88E5',
  },
});