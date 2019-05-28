/* eslint-disable jsx-a11y/click-events-have-key-events,class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import RadioButton from '../../react-chayns-radiobutton/component/RadioButton';
import Icon from '../../react-chayns-icon/component/Icon';
import TappPortal from '../../react-chayns-tapp_portal/component/TappPortal';

export default class ModeSwitch extends Component {
    static propTypes = {
        modes: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                name: PropTypes.string,
                uacIds: PropTypes.arrayOf(PropTypes.number),
            }),
        ),
        save: PropTypes.bool,
        onChange: PropTypes.func,
        defaultMode: PropTypes.number,
        show: PropTypes.bool,
        parent: PropTypes.arrayOf(PropTypes.node),
    };

    static defaultProps = {
        modes: null,
        save: false,
        onChange: null,
        defaultMode: null,
        show: null,
        parent: null,
    };

    static modes = [];

    static activeModeId = 0;

    static open = false;

    static onChangeListener = [];

    static adminSwitchSupport = false;

    static adminSwitchStatus = 0;

    static getCurrentMode() {
        const { modes, activeModeId } = ModeSwitch;
        return modes.find(mode => mode.id === activeModeId || null);
    }

    static addChangeListener(callback) {
        ModeSwitch.onChangeListener.push(callback);
        if (ModeSwitch.modes.length > 0) {
            const mode = ModeSwitch.modes.find(m => m.id === ModeSwitch.activeModeId);
            callback(mode);
        }
    }

    static removeChangeListener(callback) {
        ModeSwitch.onChangeListener.splice(ModeSwitch.onChangeListener.indexOf(callback), 1);
    }

    constructor(props) {
        super(props);

        this.toggleModeSwitch = this.toggleModeSwitch.bind(this);
        this.switchMode = this.switchMode.bind(this);
        this.setMode = this.setMode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.init = this.init.bind(this);
        this.state = {
            modes: [],
            activeModeId: null,
            open: false,
        };
        ModeSwitch.adminSwitchStatus = chayns.env.user.adminMode ? 1 : 0;
        ModeSwitch.adminSwitchSupport = !(chayns.env.appVersion < 5691 && chayns.env.isIOS && chayns.env.isApp) && !!chayns.env.user.groups.find(g => g.id === 1);
        window.chayns.ready.then(() => {
            window.chayns.addAccessTokenChangeListener(this.init);
            this.init();
        });
    }

    componentWillReceiveProps(nextProps) {
        const { modes } = this.props;
        if (chayns.env.user.isAuthenticated && nextProps.modes !== modes) {
            ModeSwitch.modes = this.setModes(nextProps.modes);
            this.setState({ modes: ModeSwitch.modes });
        }
    }

    onChange(id) {
        const { modes } = this.state;
        const { onChange } = this.props;
        const mode = modes.find(m => m && m.id === id);
        if (onChange) {
            onChange(mode);
        }
        ModeSwitch.onChangeListener.forEach((listener) => {
            listener(mode);
        });
    }

    setMode(id) {
        const { save } = this.props;
        this.setState({ activeModeId: id });
        ModeSwitch.activeModeId = id;
        if (save) {
            window.chayns.utils.ls.set('react__modeSwitch--currentMode', id);
        }
    }

    setModes(modes) {
        let newModes = modes || [];
        const user = newModes.filter(mode => mode.id === 0);
        const admin = newModes.filter(mode => mode.id === 1);
        if (admin.length === 0) {
            newModes.unshift({
                id: 1,
                name: 'chayns® Manager',
                uacIds: [1],
            });
        }
        if (user.length === 0) {
            newModes.unshift({
                id: 0,
                name: window.chayns.env.user.name,
            });
        }
        newModes = newModes.filter(mode => !mode.uacIds || this.isUserInGroup(mode.uacIds));
        return newModes;
    }

    async init() {
        const {
            defaultMode,
            save,
            modes,
            parent,
        } = this.props;

        this.pageYOffset = (parent || document.getElementsByClassName('tapp')[0] || document.body).getBoundingClientRect().top;
        if (chayns.env.user.isAuthenticated) {
            ModeSwitch.modes = this.setModes(modes);
            ModeSwitch.activeModeId = defaultMode || 0;
            ModeSwitch.open = false;

            if (ModeSwitch.adminSwitchSupport) {
                chayns.removeAdminSwitchListener(this.switchMode);
                chayns.addAdminSwitchListener(this.switchMode);
            }
            if (defaultMode) {
                ModeSwitch.activeModeId = defaultMode;
            }
            if (save) {
                const storage = window.chayns.utils.ls.get('react__modeSwitch--currentMode');
                if (chayns.utils.isNumber(storage)) {
                    ModeSwitch.activeModeId = storage;
                }
            }
            if (ModeSwitch.adminSwitchSupport && (ModeSwitch.activeModeId === 0 || ModeSwitch.activeModeId === 1)) {
                ModeSwitch.activeModeId = ModeSwitch.adminSwitchStatus;
            }
        } else {
            ModeSwitch.modes = [];
            ModeSwitch.activeModeId = null;
            ModeSwitch.open = false;
        }

        this.setState({
            modes: ModeSwitch.modes,
            activeModeId: ModeSwitch.activeModeId,
            open: ModeSwitch.open,
        });
        this.onChange(ModeSwitch.activeModeId);
    }

    switchMode(id) {
        if (id.mode !== undefined) {
            ModeSwitch.adminSwitchStatus = id.mode;
            this.setMode(id.mode);
            this.onChange(id.mode);
        } else {
            if (id === 0 && ModeSwitch.adminSwitchSupport) {
                chayns.deactivateAdminMode();
                ModeSwitch.adminSwitchStatus = 0;
            } else if (id === 1 && ModeSwitch.adminSwitchSupport) {
                chayns.activateAdminMode();
                ModeSwitch.adminSwitchStatus = 1;
            } else {
                this.onChange(id);
            }
            this.setState({ open: false });
            this.setMode(id);
        }
    }

    isUserInGroup(uacIds) {
        return !!window.chayns.env.user.groups.find(group => uacIds.indexOf(group.id) >= 0);
    }

    toggleModeSwitch() {
        const { open } = this.state;
        this.setState({ open: !open });
    }

    render() {
        const { show } = this.props;
        const { modes, open, activeModeId } = this.state;
        if ((show || (show === null && (!ModeSwitch.adminSwitchSupport || modes.length > 2))) && chayns.env.user.isAuthenticated) {
            return (
                <TappPortal>
                    <div
                        className={classNames('cc__modeswitch', { 'cc__modeswitch--open': open })}
                        style={{ top: `${this.pageYOffset}px` }}
                    >
                        <div className="cc__modeswitch__content">
                            <h2>Diese Seite verwenden als:</h2>
                            {
                                modes.map(mode => (
                                    !ModeSwitch.adminSwitchSupport || mode.id > 1 || mode.id === ModeSwitch.adminSwitchStatus
                                        ? (
                                            <div key={mode.id} className="grid__item col-1-2-desktop col-1-1-mobile">
                                                <RadioButton
                                                    name="modeSwitchRadioButtons"
                                                    value={mode.id}
                                                    onChange={this.switchMode}
                                                    checked={mode.id === activeModeId}
                                                >
                                                    {mode.name}
                                                </RadioButton>
                                            </div>
                                        )
                                        : null
                                ))
                            }
                        </div>
                        <div
                            className={classNames('cc__modeswitch__trigger', { 'cc__modeswitch__trigger--red': activeModeId > 1 })}
                            onClick={this.toggleModeSwitch}
                        >
                            <Icon icon="ts-cog" />
                        </div>
                    </div>
                </TappPortal>
            );
        }
        return null;
    }
}
