import React, { createElement } from 'react';
import connect from './store';

import {
  isTargetChanged,
  isFetchFinish,
  isLoading,
  isDeleteFinish,
  isUpdateFinish,
  isCreateFinish,
  isCollectionParamsChanged,
  removeLocalKeys
} from '../helpers';

import { defaultProps, propTypes } from './prop-types';

class FetchCollection extends React.PureComponent {
  constructor(props) {
    super(props);
    this.fetchData = this.fetchData.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onPut = this.onPut.bind(this);
    this.onPost = this.onPost.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  componentWillMount() {
    const { schemaName, localFirst, fetchData, isLoading} = this.props;
    if (schemaName && (!localFirst || (localFirst && (!fetchData && !isLoading)))) {
      this.fetchData();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (isCollectionParamsChanged(this.props, nextProps)) {
      if (isTargetChanged(this.props, nextProps)) {
        this.cleanData();
      }
      this.fetchData(nextProps);
    }
    this.handleCallBacks(this.props, nextProps);
  }

  componentWillUnmount() {
    if (this.props.leaveClean) {
      this.cleanData();
    }
  }

  onDelete(objectId) {
    const { fetchActions, schemaName, targetName } = this.props;
    if (!objectId) {
      console.warn('onDelete: missing objectId ');
      return;
    }
    fetchActions.deleteDoc({ schemaName, targetName, objectId });
  }

  onPut(objectId, data) {
    const { fetchActions, schemaName, targetName } = this.props;
    if (!objectId) {
      console.warn('onUpdateDoc: missing objectId ');
      return;
    }
    if (!data || typeof data !== 'object') {
      console.warn('onUpdateDoc: missing data object ');
      return;
    }
    fetchActions.putDoc({ schemaName, targetName, objectId, data });
  }
  onPost(data) {
    const { fetchActions, schemaName, targetName } = this.props;
    if (!data || typeof data !== 'object') {
      console.warn('onPost: missing data object ');
      return;
    }
    fetchActions.postDoc({ schemaName, targetName, data });
  }

  onRefresh() {
    this.fetchData(this.props, false);
  }

  fetchData(props = this.props, localOnly = this.props.localOnly) {
    const {
      targetName,
      schemaName,
      query,
      limit,
      skip,
      enableCount,
      keys,
      include,
      order,
      dataHandler
    } = props;
    if (localOnly || !props.schemaName) {
      return;
    }
    props.fetchActions.fetchData({
      targetName,
      schemaName,
      query,
      limit,
      skip,
      enableCount,
      keys,
      include,
      order,
      dataHandler
    });
  }

  handleCallBacks(props, nextProps) {
    const { fetchStatus, fetchData, fetchInfo, fetchError, autoRefresh } = nextProps;
    const callBackData = {error: fetchError, status: fetchStatus, data: fetchData, info: fetchInfo }
    if (isFetchFinish(props, nextProps)) {
      props.onFetchEnd(callBackData);
    } else if (isDeleteFinish(props, nextProps)) {
      if (autoRefresh) this.fetchData(nextProps);
      props.onDeleteEnd(callBackData);
    } else if (isUpdateFinish(props, nextProps)) {
      if (autoRefresh) this.fetchData(nextProps);
      props.onPutEnd(callBackData);
    } else if (isCreateFinish(props, nextProps)) {
      if (autoRefresh) this.fetchData(nextProps);
      props.onPostEnd(callBackData);
    }
  }

  cleanData() {
    const targetName = this.props.targetName || this.props.schemaName;
    this.props.fetchActions.cleanData({ targetName });
  }

  render() {
    const { fetchData, fetchStatus, fetchInfo, fetchError, component } = this.props;
    let props = removeLocalKeys(this.props);
    let propsToPass = Object.assign(props, {
      fetchProps: {
        data: fetchData,
        error: fetchError,
        status: fetchStatus,
        info: fetchInfo,
        isLoading: isLoading(fetchStatus),
        refresh: this.onRefresh,
        deleteDoc: this.onDelete,
        put: this.onPut,
        post: this.onPost
      }
    })
    if(component){
      return createElement(component, propsToPass)
    }
    return this.props.render(propsToPass);
  }
}

export default connect(FetchCollection);
FetchCollection.propTypes = propTypes;

FetchCollection.defaultProps = defaultProps;
