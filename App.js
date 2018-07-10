import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil, map, filter } from 'rxjs/operators';
import donut from './donut.png';

export default class App extends React.Component {
  _touchStart = new Subject();
  _touchMove = new Subject();
  _touchEnd = new Subject();

  _subscription = new Subscription();
  
  state = { locationX: -110, locationY: -200, pageX: 0, pageY: 0};
  
  componentDidMount() {
    this._subscription.add(this._touchStart.pipe(
      exhaustMap(start => {
        const touchId = start.id;
        const locationX = start.nativeEvent.locationX;
        const locationY = start.nativeEvent.locationY;
        return this._touchMove.pipe(
          takeUntil(this._touchEnd),
          filter(move => move.id === touchId),
          map(move => ({
            pageX: move.nativeEvent.pageX,
            pageY: move.nativeEvent.pageY,
            locationX,
            locationY,
          }))
        )
      })
    ).subscribe((state) => {
      this.setState(state);
    }))
  }
  
  render() {
    let donutX = 0;
    let donutY = 0;

    const { pageX, pageY, locationX, locationY } = this.state;

    donutX = pageX - locationX;
    donutY = pageY - locationY;

    return (
      <View style={styles.container}>
        <Text>Hey look, it's a donut you can drag and drop!</Text>
        <Image
          onMoveShouldSetResponder={() => true } 
          onMoveShouldSetResponderCapture={() => true }   
          onResponderGrant={(e) => this._touchStart.next(e) } 
          onResponderMove={(e) => this._touchMove.next(e) } 
          onResponderRelease={(e) => this._touchEnd.next(e) }
          
          style={{
            position: 'absolute',
            left: donutX,
            top: donutY,
          }} source={donut}>
        </Image>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
