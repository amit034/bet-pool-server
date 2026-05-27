import React from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {NavLink, useRouteMatch} from 'react-router-dom';

const NavigationMenu = ({previewMode}) => {
    const match = useRouteMatch();
    if (previewMode) {
        return (
            <Menu fixed='bottom' inverted fluid className="bottom-menu" widths={1}>
                <Menu.Item name='pools' as={NavLink} exact to="/pools">
                    <Icon name='globe' />
                    Pools
                </Menu.Item>
            </Menu>
        );
    }
    return (
        <Menu fixed='bottom' inverted fluid className="bottom-menu" widths={3}>
            <Menu.Item name='bets' as={NavLink} exact to={`/pools/${match.params.id}?active=true`}>
                <Icon name='calendar alternate' />
                Bettings
            </Menu.Item>
            <Menu.Item name='leaders' as={NavLink} exact to={`/pools/${match.params.id}/participates`}>
                <Icon name='trophy' />
                Leaders
            </Menu.Item>
            <Menu.Item name='pools' as={NavLink} exact to={`/pools`}>
               <Icon name='globe' />
               Pools
            </Menu.Item>
        </Menu>
    );
}

export default  NavigationMenu;