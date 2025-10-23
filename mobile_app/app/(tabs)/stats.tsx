import React, { useEffect, useState} from "react";
import {View, Text, Dimensions, StyleSheet, ScrollView} from "react-native";
import { LineChart } from "react-native-chart-kit";


//useeffect runs code when the screen loads to fetch data
//dimensions gives screen and width for responsive charts
//scrollview makes the screen scrollable if chrat is long 
//linechart from the chart lib to visualize shot trends 

//this screen when entered will make a call to the backend to retrieve user data 
//setdata is a fnction that upddates the value of data 
export default function StatsScreen(){
    const [data, setData] = useState([]);
    
    //runs once and [] at the end means only on load 
    //fetch gets the history data stored in the backend 
    //then res = converts the retreive data into redable format 
    //then json stores teh data with set data into data 
    //catch catches and errors 
    useEffect(() => {
        fetch("http://127.0.0.1:8000/get_history")
        .then((res) => res.json())
        .then((json) => setData(json.sessions || []))
        .catch((err) => console.error("Error fetching history:",err)) 
    }, []);
    if (data.length === 0){
        return (
            <View style={styles.center}>
                <Text style={styles.text}> No stats available yet</Text>
            </View>
        );
    }
    const labels = data.map((s) =>
        new Date(s.timestamp).toLocaleDateString()
    );
    const fgPercent = data.map((s) => s.FG_percent * 100);
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Monthly Shooting Trend </Text>

            <LineChart
                data={{
                    labels, 
                    datasets: [{ data: fgPercent }]
                }}
                width={Dimensions.get("window").width - 20}
                height={220}
                yAxisSuffix="%"
                chartConfig={{
                    backgroundGradientFrom: "#1E1E1E",
                    backgroundGradientTo: "#333",
                    color: (opacity = 1) => 'rgba(255, 215, 0, ${opacicty})',
                    labelColor: () => "#fff",
                }}
                style={styles.chart}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "121212"},
    header: {
        color: "white",
        fontSize:22,
        textAlign: "center",
        marginVertical: 20,

    },
    chart: {borderRadius: 16, alignSelf: "center"},
    center: { flex:1, justifyContent: "center", alignItems:"center"},
    text: {color:"#bbb"}
})