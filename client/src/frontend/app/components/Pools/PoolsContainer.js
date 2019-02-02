import React, {Fragment, Component} from 'react';
import {withRouter} from 'react-router-dom';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import _ from 'lodash';
import {connect} from 'react-redux';
import Pool from './Pool';

const PoolList = ({pools, leave, join, enter}) => {
    const poolArray = _.values(pools);
    const poolNode = _.map(poolArray, (pool) => {
        return (<Pool pool={pool} key={pool._id} leave={leave} join={join} enter={enter} />)
    });
    return (<ul className="pool-list">{poolNode}</ul>);
};

class PoolsContainer extends Component {
    componentDidMount() {
        this.props.dispatch(getUserPools());
    }

    handleLeave(id) {
        const remainder = this.state.data.filter((pool) => {
            if (pool.id !== id) return pool;
        });
        axios.delete(this.apiUrl + '/' + id)
            .then((res) => {
                this.setState({data: remainder});
            });
    }

    handleJoin(id) {
        this.props.dispatch(joinPool(id), () => this.handleEnter(id));
    }

    handleEnter(id) {
        this.props.history.push(`/pools/${id}?active=true`);
    }

    render() {
        return (
            <Fragment>
                <PoolList pools={this.props.pools}
                          auth={this.props.auth}
                          leave={this.handleLeave.bind(this)}
                          join={this.handleJoin.bind(this)}
                          enter={this.handleEnter.bind(this)}
                />
                <NavigationMenu />
            </Fragment>
        );
    }
}

const mapState = ({pools: {pools}, auth}) => ({
    auth, pools
});

export default withRouter(connect((mapState))(PoolsContainer));
