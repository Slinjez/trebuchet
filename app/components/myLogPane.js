import React from 'react';
import * as AppEvents from './../machines/appEvents';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import ClearIcon from 'material-ui/svg-icons/action/delete';
import {grey500, grey800} from 'material-ui/styles/colors';

export default class MyLogPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apps: []
    }
    
    let manager = this.props.manager;
    
    manager.on(AppEvents.VIEW_LOGS, (app) => {
      if (!this.state.value || (app && this.state.value != app.name)) {
        let defaultApp = this.state.apps.length > 0 ? this.state.apps[0].name : null;
        let definedApp = app ? app.name : null;
        let appName = definedApp ? definedApp : (defaultApp ? defaultApp : '');
        this.setState({ value: appName });
      } 
      this.setState({ visible: true  }, () => {
        document.getElementById("logContent").innerText = '';
        this.bindLogger();
      });
    });

    manager.on(AppEvents.EMIT_LOGS, (app) => { 
      if (this.state.value != app.name) {
        this.setState({
          value: app.name
        });
        document.getElementById("logContent").innerText = '';
        this.bindLogger();
      }
      this.setState({
        visible: true
      });
    });

    manager.getApps().then((apps) => {
      this.setState({ 
        apps: apps,
        value: apps.length > 0 ? apps[0].name : ''
      });
    });
  }

  handleChange = (event, index, value) => {
    this.setState({
      value: value,
      visible: true
    }, () => {
      document.getElementById("logContent").innerText = '';
      this.bindLogger();
    });
  };

  bindLogger = () => {
    let manager = this.props.manager;
    let value = this.state.value;
    manager.getApp(value).then((app) => {
      let log = manager.getAppLog(app);
      if (log != null) {
        log.on("line", (data) => {
          let lc = document.getElementById("logContent");
          let isPinned = (lc.scrollTop === (lc.scrollHeight - lc.offsetHeight));
          let d = document.createElement("div");
          d.innerText = data;
          lc.appendChild(d);
          if (isPinned) {
            lc.scrollTop = lc.scrollHeight;
          }
        });
      }
    });
  }

  clearLog = (e) => {
    document.getElementById("logContent").innerText = '';
  }

  closeClick = (e) => {
    e.preventDefault();
    this.setState({
      visible: false
    });
  }
  
  render() {
    let logs = this.state.apps.map(app => 
      <MenuItem value={app.name} primaryText={app.name} key={app.name} />
    );
    return (
      <div className="logViewer" style={{display: this.state.visible ? '' : 'none'}}>
        <div className="logHeader">
          <SelectField style={{fontSize: '13px', color: grey800}}
            className="logSelect"
            labelStyle={{color: grey800}}
            value={this.state.value}
            onChange={this.handleChange}>
            {logs}
          </SelectField>
          <div style={{float: 'right'}}>
            <IconButton
              style={{height: '48px', float: 'left'}}
              onClick={this.clearLog}>
              <ClearIcon color={grey500}/>
            </IconButton>
            <IconButton onClick={this.closeClick}>
              <CloseIcon color={grey500} />
            </IconButton>
          </div>
          <div style={{clear: "both"}}></div>
        </div>
        <div className="logContent" id="logContent"></div>
      </div>
    );
  }
}