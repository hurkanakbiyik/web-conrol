<template>
  <section>
    <header>
      <div class="search-wrapper">
        <div class="search">
          <button v-on:click="search" class="btn" type="button">
            <span>CONTROL</span>
          </button>
          <input v-model="url" placeholder="Write web site URL">
        </div>
      </div>
    </header>
    <div class="widget-group">
      <div class="widget">
        <div class="widget-front">
          <div class="widget-in">
            <div class="font-weight-500 secondary-text">TITLE</div>
            <div v-if="title" class="md-display-2 pb-8">{{title}}</div>
          </div>
          <div v-if="!title">
            <loading></loading>
          </div>
        </div>
      </div>
      <div class="widget">
        <div class="widget-front">
          <div class="widget-in">
            <div class="font-weight-500 secondary-text">VERSION</div>
            <div v-if="version" class="md-display-1 pb-8">{{version}}</div>
          </div>
          <div v-if="!version">
            <loading></loading>
          </div>
        </div>
      </div>
      <div class="widget">
        <div class="widget-front">
          <div class="widget-in">
            <div class="font-weight-500 secondary-text">LOGIN</div>
            <div v-if="loginInfo === true" class="md-display-1 pb-8 green-text">YES</div>
            <div v-if="loginInfo === false" class="md-display-1 pb-8 red-text">NO</div>
          </div>
          <div v-if="loginInfo === null">
            <loading></loading>
          </div>
        </div>
      </div>
      <div class="widget">
        <div style="text-align: center" class="widget-front-row">
          <div class="widget-in" v-for="(value, key) in heads">
            <div class="font-weight-500 secondary-text">{{key}}</div>
            <div class="md-display-1 pb-8">{{value}}</div>
          </div>
        </div>
        <div v-if="!heads">
          <loading></loading>
        </div>
      </div>
      <div class="widget widget-50">
        <div class="widget-front">
          <div class="widget-in">
            <div class="font-weight-500 secondary-text">INTERNAL LINKS</div>
            <div v-if="internals" class="md-display-1 pb-8">{{internals.length}}</div>
          </div>
          <div class="widget-in">
            <div class="font-weight-500 secondary-text green-text">INTERNAL SUCCESS</div>
            <div class="md-display-1 pb-8">{{internalSuccess}}</div>
          </div>
          <div class="widget-in">
            <div class="font-weight-500 secondary-text red-text">INTERNAL ERROR</div>
            <div class="md-display-1 pb-8">{{internalError}}</div>
          </div>
          <div class="list">
            <div class="list-item"  v-for="internal in internals">
              <div class="first">
                <a style="font-size: 14px;" :href="internal.link">{{internal.link}}</a>
              </div>
              <div class="last green-box" v-if="internal.status === 200">
                {{internal.status}}
              </div>
              <div class="last red-box" v-if="internal.status !== 200">
                {{internal.status}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="widget widget-50">
        <div class="widget-front">
          <div class="widget-in">
            <div class="font-weight-500 secondary-text">EXTERNAL LINKS</div>
            <div v-if="externals" class="md-display-1 pb-8">{{externals.length}}</div>
          </div>
          <div class="widget-in">
            <div class="font-weight-500 secondary-text green-text">EXTERNAL SUCCESS</div>
            <div class="md-display-1 pb-8">{{externalSuccess}}</div>
          </div>
          <div class="widget-in">
            <div class="font-weight-500 secondary-text red-text">EXTERNAL ERROR</div>
            <div class="md-display-1 pb-8">{{externalError}}</div>
          </div>
          <div class="list">
            <div class="list-item"  v-for="external in externals">
              <div class="first">
                <a style="font-size: 14px;" :href="external.link">{{external.link}}</a>
              </div>
              <div class="last green-box" v-if="external.status === 200">
                {{external.status}}
              </div>
              <div class="last red-box" v-if="external.status !== 200">
                {{external.status}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import Vue from 'vue'
  import VueSocketio from 'vue-socket.io'
  import Loading from './Loading'

  Vue.use(VueSocketio, 'http://localhost:3010')
  // Automaticly socket connect from url string

  export default {
    components: {Loading},
    name: 'HelloWorld',
    data () {
      return {
        url: '',
        version: '',
        title: '',
        heads: null,
        internals: [],
        externals: [],
        internalError: 0,
        internalSuccess: 0,
        externalError: 0,
        externalSuccess: 0,
        loginInfo: null
      }
    },
    sockets: {
      connect: function () {
        console.log('socket connected')
      },
      title: function (val) {
        this.title = val.data
      },
      version: function (val) {
        this.version = val.data
      },
      heads: function (val) {
        this.heads = val.data
      },
      loginInfo: function (val) {
        console.log(val)
        this.loginInfo = val.data
      },
      linkStart: function (val) {
        this.externals = []
        this.internals = []
        this.internalSuccess = 0
        this.internalError = 0
        this.externalSuccess = 0
        this.externalError = 0
        this.linkStart = val.data
      },
      link: function (val) {
        let linkData = val.data
        if (linkData.type === 'internal') {
          if (linkData.status === 200) {
            this.internalSuccess++
          } else {
            this.internalError++
          }
          this.internals.unshift(linkData)
        } else if (linkData.type === 'external') {
          if (linkData.status === 200) {
            this.externalSuccess++
          } else {
            this.externalError++
          }
          this.externals.unshift(linkData)
        }
      }
    },
    methods: {
      search: function (event) {
        this.resetData()
        this.$socket.emit('control', {
          data: {
            url: this.url
          }
        })
      },
      resetData: function () {
        this.$data = {
          version: '',
          title: '',
          heads: null,
          internals: [],
          externals: [],
          internalError: 0,
          internalSuccess: 0,
          externalError: 0,
          externalSuccess: 0,
          loginInfo: null
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  header{
    height: 56px;
    min-height: 56px;
    max-height: 56px;
    padding: 24px 8px;
    background-image: url(/src/assets/header.png);
    background-size: cover;
    background-color: #ff7500;
    color: rgba(255,255,255,1);
  }

  .list{
    flex: 100%;
    max-height: 200px;
    position: relative;
    overflow: auto;
  }

  .list-item{
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
  }

  .list-item .first{
    flex : 1
  }
  .list-item .last{

  }

  .green-box{
    background: green;
    padding: 2px 16px;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
  }
  .red-box{
    background: red;
    padding: 2px 16px;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
  }

  .widget-group{
    display: flex;
    flex-wrap: wrap;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-flex: 1;
    -ms-flex: 1 1 100%;
    flex: 1 1 100%;
    max-width: 100%;
    max-height: 100%;
  }

  .widget{
    -webkit-box-flex: 1;
    -ms-flex: 1 1 25%;
    flex: 1 1 25%;
    max-width: 25%;
    max-height: 100%;
    box-sizing: border-box;
    position: relative;
    font-size: 1.3rem;
    -webkit-perspective: 3000px;
    perspective: 3000px;
    padding: 12px;
  }
  .widget.widget-50{
    -webkit-box-flex: 1;
    -ms-flex: 1 1 50%;
    flex: 1 1 50%;
    max-width: 50%;
  }
  .widget-front{
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    padding: 16px;
    position:relative;
    flex: 1;
    background-color: #fff;
    display: flex;
    flex-wrap: wrap;
  }

  .widget-front-row{
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    padding: 16px;
    position:relative;
    flex: 1;
    flex-direction: row;
    display: flex;
    height: 100px;
    background-color: #fff;
  }

  .widget-in{
    height: 100px;
    flex : 1
  }

  .md-display-1{
    text-align: center;
    font-size: 34px;
    font-weight: 400;
    line-height: 40px;
  }

  .md-display-2{
    text-align: center;
    font-size: 18px;
    font-weight: 400;
    line-height: 40px;
  }

  .secondary-text{
    text-align: center;
    color: grey;
    width: 100%;
  }


  .search-wrapper{
    background: #FFFFFF;
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    min-height: initial;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    box-sizing: border-box;
    max-width: 100%;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    align-content: center;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
  }

  .search{
    height: 56px;
    line-height: 56px;
    padding: 18px;
    background: #FFFFFF;
    min-width: 0;
    min-height: initial;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    box-sizing: border-box;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    max-width: 100%;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    align-content: center;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
  }

  .search input{
    padding-left: 16px;
    height: 56px;
    color: rgba(0, 0, 0, 0.54);    border-radius: 0;
    -moz-appearance: none;
    -webkit-appearance: none;
    border: none;
    margin: 0;
    min-height: initial;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    box-sizing: border-box;
    font-size: 100%;
    outline: none;
  }

  .btn {
    position: relative;

    display: block;
    margin: 30px auto;
    padding: 0;

    overflow: hidden;

    border-width: 0;
    outline: none;
    border-radius: 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .6);

    background-color: #3d648c;
    color: #ecf0f1;

    transition: background-color .3s;
  }

  .btn:hover, .btn:focus {
    background-color: #3d648c;
  }

  .btn > * {
    position: relative;
  }

  .btn span {
    display: block;
    padding: 12px 24px;
  }

  .btn:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    width: 0;
    padding-top: 0;
    border-radius: 100%;
    background-color: rgba(236, 240, 241, .3);
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  .btn:active:before {
    width: 120%;
    padding-top: 120%;

    transition: width .2s ease-out, padding-top .2s ease-out;
  }

  .green-text{
    color : #008800;
  }
  .red-text{
    color : #C21F39;
  }

</style>
