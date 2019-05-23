import React, { Component } from 'react';
import { Tabs, Tab, Typography } from '@material-ui/core';

import './createERC.css';
import RequiredMetadata from './requiredMetadata/RequiredMetadata';

function TabContainer(props) {
    return (
      <Typography component="div" style={{ padding: 8 * 3 }}>
        {props.children}
      </Typography>
    );
  }

class CreateERC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value:0,
        }
    }

    handleChange = (evt, val) => {
        this.setState({
            value:val,
        })
    }

    render() {
        const { value } = this.state;
        return (
            <div>
                <Tabs
                value={value}
                onChange={this.handleChange}
                scrollButtons="on"
                indicatorColor="primary"
                centered
                textColor="primary">
                    <Tab label="Required Metadata"/>
                    <Tab label="Spatiotemporal Metadata"/>
                    <Tab label="Create bindings"/>
                </Tabs>
                    {value === 0 && 
                <TabContainer>
                    <RequiredMetadata authors={[1,2,3]}>
                    </RequiredMetadata>
                </TabContainer>}
                {value === 1 && <TabContainer>Item Two</TabContainer>}
                {value === 2 && <TabContainer>Item Three</TabContainer>}
            </div>
        );
    }
}

export default CreateERC;