import React from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {NavLink, useRouteMatch} from 'react-router-dom';

const NavigationMenu = () => {
    const match = useRouteMatch();
    return (
        <Menu fixed='bottom' inverted fluid className="bottom-menu" widths={3}>
            <Menu.Item name='bets' as={NavLink} exact to={`/pools/${match.params.id}?active=true`}>
                <Icon name='calendar alternate' />
                Bettings
            </Menu.Item>
            <Menu.Item name='leaders' as={NavLink} exact to={`/pools/${match.params.id}/participates`}>
                <Icon name='cubes' />
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