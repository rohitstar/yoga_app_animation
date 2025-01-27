import Constants from 'expo-constants'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
const { width } = Dimensions.get('window')
import Animated, { Extrapolate, Extrapolation, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

import { Entypo, Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { Directions, Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import data, { locationImage } from './data'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import AppLoading from 'expo-app-loading'
import { LinearGradient } from 'expo-linear-gradient'
import { opacity } from 'react-native-reanimated/lib/typescript/Colors'
import { useEffect, useState } from 'react'

const duration = 600
const _size = width * 0.9
const layout = {
  borderRadius: 16,
  width: _size,
  height: _size * 0.8,
  spacing: 12,
  cardsGap: 22,
}
const maxVisibleItems = 6
const backgroundColors = ['#fdd2d2', '#a0f8d5', '#ab9afc', '#fdeac7', '#4c97b8', '#62e1dd', '#f49db3'];


const colors = {
  primary: '#6667AB',
  light: '#fff',
  dark: '#111',
}

const Card = ({
  info,
  index,
  totalLength,
  activeIndex,
  flingDirection,
  hideText, // New prop to control text visibility
}: {
  info: (typeof data)[0],
  index: number,
  totalLength: number,
  activeIndex: SharedValue<number>
  flingDirection: SharedValue<string>
  hideText: boolean;
}) => {


  const fixedBackgroundColor = backgroundColors[index % backgroundColors.length];
  const style = useAnimatedStyle(() => {

    return {
      position: 'absolute',
      zIndex: totalLength - index,
      backgroundColor: fixedBackgroundColor,
      opacity: interpolate(
        activeIndex.value,
        [index - 1, index, index + 1],
        [1 - 1 / maxVisibleItems, 1, 1],
        // Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [-layout.cardsGap, 30, layout.height + layout.cardsGap + 30],

          ),
        },
        {
          scale: interpolate(activeIndex.value,
            [index - 1, index, index + 1],
            [0.96, 1, 1],
            // Extrapolation.CLAMP
          )
        }]
    }
  })



  // Animation for header text fade-out and image expansion
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [1, 1, 0], // Fades out as the card is flung down
    );

    return {
      opacity,
    };
  });



  // const imageStyles = useAnimatedStyle(() => {
  //   const scale = interpolate(
  //     activeIndex.value,
  //     [index - 1, index, index + 1],
  //     [0.8, 1.5, 1.5], // Image expands when the card is flung down
  //   );
  //   return {
  //     transform: [{ scale }],
  //   };
  // });


  // Animated style for the image size
  const imageStyle = useAnimatedStyle(() => {
    const width = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [layout.width, layout.width, layout.width], // Increase width
    );
    const height = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [layout.height * 0.58, layout.height * 0.81, layout.height], // Increase height
    );

    return {
      width,
      height,
    };
  });



  return (
    <Animated.View style={[styles.card, style]}>
      {/* {activeIndex.value === index &&  */}
      <View style={styles.cardContent}>
        <Animated.Text style={[styles.title, headerStyle]}>{info.type}</Animated.Text>
      </View>
      {/* } */}

      <Animated.Image source={info.locationImage} style={[styles.locationImage, imageStyle]} resizeMode="cover" />
      {/* {!hideText && (  */}
        <Text style={styles.titleText}>Happier Person</Text>
      {/* )} */}

      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playButtonText}>▶</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const HomeScreen = () => {
  const activeIndex = useSharedValue(0);
  const flingDirection = useSharedValue("none");



  // Add bounce effect on initial load
  useEffect(() => {
  
    activeIndex.value = withSpring(1, {
      damping: 10,
      stiffness: 10,
      mass: 1,
    });

    setTimeout(() => {
      activeIndex.value = withSpring(0, {
        damping: 10,
        stiffness: 10,
        mass: 1,
      });
    }, 1000);
  }, []);


  const [hideText, setHideText] = useState<boolean[]>(
    Array(data.length).fill(false) 
  );

  const flingUp = Gesture.Fling().direction(Directions.UP).onStart(() => {
    if (activeIndex.value <= 0) {
      return; 
    }

    flingDirection.value = "up"; 
    activeIndex.value = withSpring(activeIndex.value - 1, {
      damping: 20,
      mass: 8,
      stiffness: 120,
   
    });

    // activeIndex.value = withTiming(activeIndex.value - 1, {
    //   duration,
    // });
    console.log('fling up');
  })

  const flingDown = Gesture.Fling().direction(Directions.DOWN).onStart(() => {
    if (activeIndex.value >= data.length - 1) {
      return; 
    }

    flingDirection.value = "down"; // Set fling direction

    activeIndex.value = withSpring(activeIndex.value + 1, {
      damping: 20,
      stiffness: 120,
      mass: 8,
     
    });
   
    console.log('fling Down');
  })

  return (
    <LinearGradient
      colors={['#472361', '#111', '#000', '#000', '#000', '#000', '#000']} style={styles.container}>
      <GestureHandlerRootView >
        <StatusBar hidden />

        <GestureDetector
          gesture={Gesture.Exclusive(flingUp, flingDown)}
        >
          <View
            style={{
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center', //flex-end
              marginTop: layout.cardsGap * 2,
            }}
            pointerEvents="box-none"
          >
            {data.map((c, index) => {
              return (
                <Card
                  info={c}
                  key={c.id}
                  index={index}
                  totalLength={data.length - 1}
                  activeIndex={activeIndex}
                  flingDirection={flingDirection}
                  hideText={hideText[index]}
                />
              )
            })}
          </View>
        </GestureDetector>

      </GestureHandlerRootView>
    </LinearGradient>
  );
};

const YogaScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Yoga Screen</Text>
  </View>
);

const SleepScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Sleep Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Profile Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function App() {

  const [fontsLoaded] = useFonts({
    "Unna-Regular": require("./assets/font/Unna-Regular.ttf"),
    "Unna-Bold": require("./assets/font/Unna-Bold.ttf"),
    "Unna-BoldItalic": require("./assets/font/Unna-BoldItalic.ttf"),
  });

  if (!fontsLoaded) {
    return <AppLoading />; // Show loading until fonts are loaded
  }

  return (
    <NavigationContainer>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "Yoga") {
              iconName = "fitness-outline";
            } else if (route.name === "Sleep") {
              iconName = "moon-outline";
            } else if (route.name === "Profile") {
              iconName = "person-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          headerStyle: { backgroundColor: "#1A1A2E" },
          headerTitleStyle: { color: "#fff", fontSize: 18 },
          tabBarStyle: {
            backgroundColor: "#2d322f",
            // borderTopLeftRadius: 10, borderTopRightRadius: 10 
          },
          tabBarActiveTintColor: "#FFD700",
          tabBarInactiveTintColor: "#fff",
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Yoga" component={YogaScreen} />
        <Tab.Screen name="Sleep" component={SleepScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: colors.dark,
    padding: layout.spacing,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  card: {
    borderRadius: layout.borderRadius,
    width: layout.width,
    height: layout.height,
    // padding: layout.spacing,
    // marginTop: layout.spacing,
    backgroundColor: colors.light,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,

  },
  title: { fontSize: 24, fontWeight: '600', fontFamily: "Unna-Regular", },
  subtitle: {},
  cardContent: {
    gap: layout.spacing,
    marginVertical: layout.spacing + 2,
    marginHorizontal: layout.spacing + 15
    // marginBottom: layout.spacing,
  },
  locationImage: {
    // flex: 1,
    borderRadius: layout.borderRadius - layout.spacing / 2,
    shadowColor: "#eee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,

  },
  row: {
    flexDirection: 'row',
    columnGap: layout.spacing / 2,
    alignItems: 'center',
  },
  icon: {},
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
  },
  screenText: {
    fontSize: 24,
    color: "#fff",
  },
  titleText: {
    fontSize: 35,
    // borderColor: '#fff',
    // borderWidth: 1,
    fontFamily: "Unna-Regular",
    color: "#FFF",
    fontWeight: "700",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 15,
    left: 15,
  },
  playButton: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 15,
    right: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
})