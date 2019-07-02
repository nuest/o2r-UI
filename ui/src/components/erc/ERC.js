import React from 'react';
import 'react-reflex/styles.css';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { InputLabel, FormControl, Select, FilledInput } from "@material-ui/core";
import uuid from 'uuid/v1';

import './erc.css';
import httpRequests from '../../helpers/httpRequests';
import MainView from './MainView/MainView';
import CodeView from './CodeView/CodeView';
import DataView from './DataView/DataView';

class ERC extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            id: this.props.match.params.id,
            mainFile: null,
            dataSet: null,
            codeFile: null,
            inputfiles: null,
        };
        
    }

    componentDidMount() {
        this.getMetadata();
    }

    setDataFile(dataFile) {
        const self = this;
        httpRequests.getFile("http://localhost/api/v1/compendium/"+self.state.id+"/data/" + dataFile)
            .then(function(res) {
                httpRequests.getFile("http://localhost/api/v1/compendium/"+self.state.id+"/data/")
                    .then(function(res2) {
                        self.setState({
                            dataSet: {
                                dataFile: dataFile,
                                data: res.data,
                                tree: res2.data.children,
                            },
                        });
                    })
                    .catch(function(res2) {
                        console.log(res2)
                    })   
            })
            .catch(function(res) {
                console.log(res)
            })
    }

    setCodeFile(codeFile) {
        this.setState({
            codeFile: codeFile,
        });        
    }

    setMainFile(mainFile) {
        this.setState({
            mainFile: mainFile,
        });        
    }

    handleChange(evt) {
        this.setDataFile(evt.target.value)
    } 

    getMetadata() {
        const self = this;
        httpRequests.singleCompendium(this.state.id)
            .then(function(response) {
                const data = response.data.metadata.o2r;
                console.log(data)
                self.setState({
                    inputfiles: data.inputfiles,
                    dataSet: data.inputfiles[0],
                });
                self.setMainFile(data.displayfile);
                self.setDataFile(data.inputfiles[0]);
                self.setCodeFile(data.codefiles[0]);
            })
            .catch(function (response) {
                console.log(response)
            })
    }
  
    render () {

        return (
            <div className="Erc">
                <ReflexContainer style={{ height: "87vh" }} orientation="vertical">
                    <ReflexElement>
                        {this.state.dataSet!=null ? <MainView 
                                                        filePath={"http://localhost/api/v1/compendium/"+this.state.id+"/data/"+this.state.mainFile}>
                                                    </MainView> : <div>There is no file to display</div>}
                    </ReflexElement>
                    <ReflexSplitter propagate={true} style={{ width: "10px" }} />
                    <ReflexElement className="right-pane">
                        <ReflexContainer orientation="horizontal">
                            <ReflexElement className="right-up">
                                {this.state.dataSet!=null ? <CodeView fileName={this.state.codeFile}></CodeView> : <div>There is no data to display</div>}
                            </ReflexElement>
                            <ReflexSplitter propagate={true} style={{ height: "10px" }} />
                            <ReflexElement className="right-bottom">
                                {this.state.inputfiles!=null ? 
                                <FormControl variant="outlined">
                                    <InputLabel htmlFor="outlined-age-native-simple"></InputLabel>
                                    <Select
                                        native
                                        value={this.state.dataSet.dataFile}
                                        onChange={this.handleChange.bind(this)}
                                        input={<FilledInput name="dataset" id="filled-age-native-simple" />}
                                    >
                                        {this.state.inputfiles.map(option => (
                                            <option value={option} key={uuid()}>{option}</option>
                                        ))}
                                    </Select>
                                </FormControl> : ''}
                                {this.state.dataSet!=null ? <DataView data={this.state.dataSet}></DataView> : <div>There is no code to display</div>}
                            </ReflexElement>
                        </ReflexContainer>
                    </ReflexElement>
                </ReflexContainer>
            </div>
        )
    }
}

export default ERC;