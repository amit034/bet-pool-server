import React from 'react'
import {Menu, Icon} from 'semantic-ui-react'
import {NavLink, withRouter} from 'react-router-dom'

class NavigationMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Menu fixed='bottom' inverted fluid className="bottom-menu" widths={3}>
                <Menu.Item name='bets' as={NavLink} exact to={`/pools/${this.props.match.params.id}?active=true`}>
                    <Icon name='calendar alternate' />
                    Bettings
                </Menu.Item>
                <Menu.Item name='leaders' as={NavLink} exact to={`/pools/${this.props.match.params.id}/participates`}>
                    <Icon name='cubes' />
                    Leaders
                </Menu.Item>
                <Menu.Item name='pools' as={NavLink} exact to={`/pools`}>
                   <Icon name='globe' />
                   Pools
                </Menu.Item>
            </Menu>
        )
    }
}

export default withRouter(NavigationMenu)