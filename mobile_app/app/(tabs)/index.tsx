import React, { useState } from "react";
//react is the library that lest UI building components 
//useState is react hook that lets you remember data 
//thesebelow are like html tags for mobile apps 
import {View, Text, Button, StyleSheet} from "react-native";

//define home screen and result variable to store backend data
export default function HomeScreen(){
  const [result, setResult] = useState<any>(null);
  
  const handleTestApi = async() => {
    try {
      const response = await fetch("http://192.168.1.218:8000/live")
      const data = await response.json();
      setResult(data);
    } catch (error){
      console.error("Error connecting to backend: ", error)
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Shot Tracker App</Text>
      <Button title="Test Backend Connect/Results" onPress={handleTestApi}/>
      {result && (
        <Text style={styles.result}>
          FGM: {result.FGM} | FGA {result.FGA} | FG%: {result["FG%"]}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff1"
  },
  title: {
    fontSize:30,
    fontWeight:"600",
    marginBottom:20
  },
  result: {
    marginTop:15,
    fontSize:18,
    color: "green",
  },

});