import React from 'react'
import {Menu, Icon} from 'semantic-ui-react'
import {NavLink, withRouter} from 'react-router-dom'

class NavigationMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Menu fixed='bottom' fluid className="bottom-menu" widths={3}>
                <Menu.Item name='pools' >
                    <Icon name='globe' />
                    Pools
                </Menu.Item>
                <Menu.Item  name='trophies'>
                    <Icon name='trophy' />
                    Trophies
                </Menu.Item>
                <Menu.Item name='new' as={NavLink} exact to={'/newPool'}>
                    <Icon name="plus circle" />
                    New Pool
                </Menu.Item>
            </Menu>
        )
    }
}

export default withRouter(NavigationMenu)
