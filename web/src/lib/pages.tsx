import { h, Component } from 'preact';
import Icon from './icon';
import About from './pages/about';
import Home from './pages/home';
import Listen from './pages/listen';
import Record from './pages/record';
import NotFound from './pages/not-found';
import User from './user';

const URLS = {
  ROOT: '/',
  HOME: '/home',
  RECORD: '/record',
  LISTEN: '/listen',
  ABOUT: '/about',
  NOTFOUND: '/not-found'
};

interface PagesProps {
  user: User;
  currentPage: string;
  navigate(url: string): void;
}

interface PagesState {
  isMenuVisible: boolean;
  pageTransitioning: boolean;
  currentPage: string;
}

export default class Pages extends Component<PagesProps, PagesState> {
  private header: HTMLElement;
  private content: HTMLElement;

  state = {
    isMenuVisible: false,
    pageTransitioning: false,
    currentPage: '/'
  };

  private isValidPage(url): boolean {
    return Object.keys(URLS).some(key => {
      return URLS[key] === url;
    });
  }

  private isPageActive(url: string|string[], page?: string): string {
    if (!page) {
      page = this.state.currentPage;
    }

    if (!Array.isArray(url)) {
      url = [url];
    }

    let isActive = url.some(u => {
      return u === page;
    });

    return isActive ? 'active' : '';
  }

  private addScrollListener() {
    this.content.addEventListener('scroll', evt => {
      this.header.classList.toggle('scrolled', this.content.scrollTop > 0);
    });
  }

  componentDidMount() {
    this.content = document.getElementById('content');
    this.header = document.querySelector('header');
    this.addScrollListener();
  }

  private isNotFoundActive(): string {
    return !this.isValidPage(this.props.currentPage) ? 'active' : '';
  }

  componentWillUpdate(nextProps: PagesProps) {
    // When the current page changes, hide the menu.
    if (nextProps.currentPage !== this.props.currentPage) {
      var self = this;
      this.content.addEventListener('transitionend', function remove() {
        self.content.removeEventListener('transitionend', remove);
        self.setState({
          currentPage: nextProps.currentPage,
          pageTransitioning: false
        });
      });

      this.setState({
        isMenuVisible: false,
        pageTransitioning: true
      });
    }
  }

  toggleMenu = () => {
    this.setState({ isMenuVisible: !this.state.isMenuVisible });
  }

  render() {
    return <div id="main">
      <header className={(this.state.isMenuVisible ? 'active' : '')}>
        <a id="main-logo" href="/"
          onClick={(evt) =>  {
            evt.preventDefault();
            evt.stopPropagation();
            this.props.navigate('/');
          }}>
          <span id="main-title">Common Voice</span><br />
          <img id="main-mozilla-logo" src="/img/mozilla.svg" />
        </a>
        <button id="hamburger-menu" onClick={this.toggleMenu}
          className={(this.state.isMenuVisible ? ' is-active' : '')}>
          <Icon type="hamburger" />
        </button>
        {this.renderNav('main-nav')}
      </header>
      <div id="content" className={this.state.pageTransitioning ?
                                   'transitioning': ''}>
        <Home active={this.isPageActive([URLS.HOME, URLS.ROOT])}
              navigate={this.props.navigate} />
        <Record active={this.isPageActive(URLS.RECORD)}
                user={this.props.user} />
        <Listen active={this.isPageActive(URLS.LISTEN)} />
        <About active={this.isPageActive(URLS.ABOUT)} />
        <NotFound active={this.isNotFoundActive()} />
      </div>
      <div id="navigation-modal"
           className={this.state.isMenuVisible && 'is-active'}>
      {this.renderNav()}
      </div>
    </div>;
  }

  private renderTab(url: string, name: string) {
    return <a className={'tab ' + this.isPageActive(url, this.props.currentPage)}
              onClick={this.props.navigate.bind(null, url)}>
             <span className="tab-name">{name}</span>
           </a>;
  }

  private renderNav(id?: string) {
    return <nav id={id} className="nav-list">
      {this.renderTab('/', 'home')}
      {this.renderTab('/about', 'about')}
      {this.renderTab('/record', 'record')}
      {this.renderTab('/listen', 'listen')}
    </nav>;
  }
}
