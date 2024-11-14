import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Calendar from 'expo-calendar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Definiera MoodLog-gränssnittet
interface MoodLog {
  mood: string;
  date: string;
  image?: string;
}

// Skärm för att visa och hantera humörval
const MoodScreen = ({ }) => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const moods = ['😊', '😢', '😐', '😴', '🥰', '🤬', '😂'];

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed to access calendar');
      }
    })();
  }, []);

  const handleMoodSelect = async (mood: string) => {
    const newLog: MoodLog = { mood, date: new Date().toLocaleString() };
    setMoodLogs([newLog, ...moodLogs]);
    await addMoodToCalendar(newLog);
  };

  const addMoodToCalendar = async (log: MoodLog) => {
    const calendars = await Calendar.getCalendarsAsync();
    const calendar = calendars[0];

    if (!calendar) {
      Alert.alert('No calendar found.');
      return;
    }

    await Calendar.createEventAsync(calendar.id, {
      title: `Mood: ${log.mood}`,
      startDate: new Date(),
      endDate: new Date(),
      timeZone: 'GMT',
      location: 'Mood Tracker'
    });
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const newLog: MoodLog = {
        mood: 'ImageMood',
        date: new Date().toLocaleString(),
        image: result.assets[0].uri,
      };
      setMoodLogs([newLog, ...moodLogs]);
      await addMoodToCalendar(newLog);
    }
  };

  const shareMoodLog = async () => {
    if (await Sharing.isAvailableAsync()) {
      const uri = moodLogs[0]?.image;
      if (uri) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('No image to share');
      }
    } else {
      Alert.alert('Sharing is not available on this device');
    }
  };

  return (
    <LinearGradient colors={['#FFDD44', '#FF8844']} style={styles.container}>
      <Text style={styles.title}>Select Your Mood</Text>
      <View style={styles.moodButtons}>
        {moods.map((mood) => (
          <Button key={mood} title={mood} onPress={() => handleMoodSelect(mood)} />
        ))}
      </View>

      <Button title="Upload Mood Image" onPress={handleImagePick} />
      <Button title="Share Mood Log" onPress={shareMoodLog} />

      <FlatList
        data={moodLogs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{item.date} - Mood: {item.mood}</Text>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
          </View>
        )}
      />
    </LinearGradient>
  );
};

// Skärm för att visa information om appen
const InfoScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Information</Text>
      <Text>This is a simple mood tracker app. Track your mood and share it!</Text>
    </View>
  );
};

// Skapa Drawer Navigator för att hantera navigering mellan skärmar
const Drawer = createDrawerNavigator();

// Huvud App-komponent med navigering
const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Mood">
        <Drawer.Screen name="Mood" component={MoodScreen} />
        <Drawer.Screen name="Info" component={InfoScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    marginBottom: 20,
  },
  moodButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    fontSize: 20,
  },
  logItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    marginTop: 5,
  },
});

export default App;
