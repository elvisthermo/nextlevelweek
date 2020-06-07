import React, { useEffect, useState } from "react";
import Constants from "expo-constants";
import { Feather as Icon } from "@expo/vector-icons";
import { 
  View, StyleSheet, Text,TouchableOpacity,
  ScrollView, Image, SafeAreaView, Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import api from "../../services/api";
import Location from "expo-location";

interface Item {
  id: number
  title: string
  image_url: string
}

interface Point {
  id: number
  name: string
  image: string
  image_url: string
  latitude: number
  longitude: number
}

interface Params {
  uf: string
  city: string
}

const Points = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [initPosition, setInitPosition] = useState<[number,number]>([0,0,]);
  const navigation = useNavigation();
  const routeParams = (useRoute()).params as Params;

  useEffect(() => {
    const loadPosition = async () => {
      const { status } = await Location.requestPermissionsAsync();
      if(status !== 'granted') {
        Alert.alert('Ops...','Precisamos de sua permissão para obter a localização');
        return;
      }
      const { latitude, longitude } = (await Location.getCurrentPositionAsync()).coords;
      setInitPosition([latitude,longitude]);
    }
    loadPosition();
  }, [])

  useEffect(() => {
    api.get('items').then(({ data }) => setItems(data))
  }, []);

  useEffect(() => {
    api.get('points', {
      params: {
        uf: routeParams.uf,
        city: routeParams.city,
        items: selectedItems
      }
    }).then(({ data }) => setPoints(data));
  }, [selectedItems]);
  
  const handleNavigateToHome = () => navigation.goBack();

  const handleNavigateToDetail = (
    id: number
  ) => navigation.navigate("Detail", { point_id: id });

  const handleSelectItem = (id: number) => {
    (selectedItems.findIndex(item => item === id) >= 0) ?
      setSelectedItems(selectedItems.filter(item => item !== id))
    : setSelectedItems([ ...selectedItems, id ]);
  }

  return(
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateToHome}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>
        <View style={styles.mapContainer}>
          { initPosition[0] !== 0 && (
            <MapView 
              style={styles.map}
              initialRegion={{
                latitude: initPosition[0],
                longitude: initPosition[1],
                latitudeDelta: 0.017,
                longitudeDelta: 0.017
              }} 
            >
              {points.map(point => (
                <Marker 
                  key={String(point.id)}
                  style={styles.mapMarker} 
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  onPress={() => handleNavigateToDetail(point.id)}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image 
                      style={styles.mapMarkerImage} 
                      source={{ uri: point.image_url }} 
                    />
                    <Text style={styles.mapMarkerTitle}>
                      {point.name}
                    </Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          ) }
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map(item => (
            <TouchableOpacity 
              key={String(item.id)} 
              style={[
                styles.item, 
                selectedItems.includes(item.id) ? 
                  styles.selectedItem 
                : {}
              ]} 
              onPress={() => handleSelectItem(item.id)}
              activeOpacity={.5}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Points;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});