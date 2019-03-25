import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { CSSTransition } from 'react-transition-group';

import isDescendant from '../../utils/isDescendant';
import TappPortal from '../../react-chayns-tapp_portal/component/TappPortal';

export default class InputBox extends Component {
    static propTypes = {
        inputComponent: PropTypes.node.isRequired,
        parent: PropTypes.node,
        onFocus: PropTypes.func,
        children: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.arrayOf(PropTypes.node),
        ]),
        className: PropTypes.string,
        boxClassName: PropTypes.string,
        inputRef: PropTypes.func,
        overlayProps: PropTypes.object,
    };

    static defaultProps = {
        parent: null,
        onFocus: null,
        children: null,
        className: null,
        boxClassName: null,
        inputRef: null,
        overlayProps: null,
    };

    state = {
        hidden: true,
        position: null,
    };

    references = {
        box: null,
        wrapper: null,
    };

    constructor(props) {
        super(props);

        this.setWrapperRef = this.setRef.bind(this, 'wrapper');
        this.setBoxRef = this.setBoxRef.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.updatePosition = this.updatePosition.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleBlur);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleBlur);
    }

    setRef(name, ref) {
        this.references[name] = ref;
    }

    setBoxRef(ref) {
        const { overlayProps } = this.props;

        this.references.box = ref;

        if (overlayProps && overlayProps.ref) {
            overlayProps.ref(ref);
        }
    }

    handleBlur(e) {
        const { hidden } = this.state;
        if (hidden) {
            return;
        }

        if (e.target === this.references.wrapper || e.target === this.references.box) {
            return;
        }

        if (isDescendant(this.references.wrapper, e.target) || isDescendant(this.references.box, e.target)) {
            return;
        }

        this.setState({
            hidden: true,
        });
    }

    async handleFocus(e) {
        const { onFocus } = this.props;

        await this.updatePosition();

        this.setState({
            hidden: false,
        });

        if (onFocus) {
            return onFocus(e);
        }

        return null;
    }

    async updatePosition() {
        if (!this.references.wrapper) {
            this.setState({
                position: null,
            });
            return;
        }

        const rect = this.references.wrapper.getBoundingClientRect();
        let { bottom } = rect;

        if (chayns.env.isApp) {
            const { pageYOffset } = await chayns.getWindowMetrics();
            bottom += pageYOffset;
        }

        this.setState({
            position: {
                width: rect.width,
                left: rect.left,
                bottom,
            },
        });
    }

    render() {
        const {
            inputComponent: InputComponent,
            children,
            parent,
            inputRef,
            onFocus,
            className,
            overlayProps,
            boxClassName,
            ...props
        } = this.props;
        const { hidden, position } = this.state;

        if (!InputComponent) {
            return null;
        }

        return (
            <div
                style={{
                    display: 'inline-block'
                }}
                className={classnames('cc__input-box', className)}
                ref={this.setWrapperRef}
            >
                <InputComponent
                    {...props}
                    ref={inputRef}
                    onFocus={this.handleFocus}
                />
                <TappPortal parent={parent}>
                    <CSSTransition
                        in={!!(position && !hidden && children)}
                        timeout={200}
                        unmountOnExit
                        classNames="fade"
                    >
                        <div
                            onClick={e => e.preventDefault()}
                            className={classnames('cc__input-box__overlay', 'scrollbar', boxClassName)}
                            style={position ? {
                                width: `${position.width}px`,
                                top: `${position.bottom}px`,
                                left: `${position.left}px`,
                            } : null}
                            {...overlayProps}
                            ref={this.setBoxRef}
                        >
                            {children}
                        </div>
                    </CSSTransition>
                </TappPortal>
            </div>
        );
    }
}
