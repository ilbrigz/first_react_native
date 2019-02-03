import React from "react";
import { View, PanResponder, Animated, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

export default class Deck extends React.Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  };

  constructor(props) {
    super(props);
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true, //this panrespnder will handle the touch event
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      }, // on dragging this will be called
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe("left");
        } else {
          this.resetPosition();
        }
      } //on letgo drag or just touch
    });
    this.state = { index: 0 };

    this.panResponder = panResponder;
    this.position = position;
  }

  forceSwipe(direction) {
    Animated.timing(this.position, {
      toValue: {
        x: direction === "right" ? SCREEN_WIDTH * 1.4 : -SCREEN_WIDTH * 1.4,
        y: 0
      },
      duration: 250
    }).start(() => {
      this.onSwipeComplete("direction");
    });
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, data, onSwipeRight } = this.props;
    const item = data[this.state.index];

    direction === "left" ? onSwipeLeft(item) : onSwipeRight(item);
    this.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  }

  resetPosition() {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  getCardStyle() {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 2, 0, SCREEN_WIDTH * 2],
      outputRange: ["-120deg", "0deg", "120deg"]
    });
    return { ...this.position.getLayout(), transform: [{ rotate }] };
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, index) => {
      if (index < this.state.index) return null;
      if (index === this.state.index) {
        //animate the topmost card only
        return (
          <Animated.View
            key={item.id}
            style={this.getCardStyle()}
            {...this.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return this.props.renderCard(item);
    });
  }
  render() {
    return <View>{this.renderCards()}</View>;
  }
}
