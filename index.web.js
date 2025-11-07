import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('PodcastPlayerApp', () => App);

// Run the app
AppRegistry.runApplication('PodcastPlayerApp', {
  rootTag: document.getElementById('root'),
});