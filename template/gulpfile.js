var gulp = require('gulp');
var shell = require('gulp-shell');
var install = require('gulp-install');
var path = require('path');
var json = require(path.join(__dirname,'package.json'));
var gitbook = require('gitbook');
var run = require('gulp-run');
var git = require('simple-git');
var fs = require('fs-extra');
var ghpages = require('gh-pages');


//------------------------------------------------------------------------------------
// Repositorio Github

gulp.task('push_inicial', function(){
    git()
        .init()
        .add('./*')
        .commit("first commit")
        .addRemote('origin', json.repository.url)
        .push('origin', 'master');
});

gulp.task('push', function(){
    git()
        .add('./*')
        .commit("Actualizando Gitbook.")
        .push('origin', 'master');
});

//------------------------------------------------------------------------------------
// Instalar dependencias y recursos

gulp.task('instalar_recursos',['instalar_dependencias','instalar_plugins']);

gulp.task('instalar_dependencias', function()
{
    gulp.src(['./package.json']).pipe(install())
});

gulp.task('instalar_plugins', function()
{
    return gulp.src('').pipe(shell([
        'gitbook install'    
    ])) 
});

//------------------------------------------------------------------------------------

// Generate-Gitbook

gulp.task('generate-gitbook',function(){
    if (!fs.existsSync(path.join(__dirname, 'gh-pages'))){
        fs.mkdirSync(path.join(__dirname, 'gh-pages'));
    }
    new Promise((resolve,reject) =>{
       return run(path.join(__dirname,'scripts','generate-gitbook')).exec(); 
    });
});

//Generate-Wiki

gulp.task('generate-wiki', function(){
    return run(path.join(__dirname,'scripts','generate-wiki')).exec();
});

//Deploy gitbook

gulp.task('deploy-gitbook', function()
{
    ghpages.publish(path.join(__dirname, 'gh-pages'), function(err) { if(err) console.error("Error:" + err); });
});

//Deploy

gulp.task('deploy', ['instalar_recursos','generate-gitbook','generate-wiki', 'deploy-gitbook'], function()
{
    console.log("Deploy task");
    
    fs.remove(path.resolve(path.join(__dirname,'wiki','.git')));
    new Promise((resolve,reject) => {
        git(path.resolve(path.join(__dirname,'wiki')))
        .init()
        .add('./*')
        .commit("Deploy to wiki")
        .addRemote('origin', json.repository.wiki)
        .push(['--force', 'origin', 'master:master'], resolve)
    });
    
    // return gulp.src('').pipe(shell(['./scripts/losh deploy-wiki']));
});

//------------------------------------------------------------------------------------

// gulp.task('default', function(){
//     gulp.watch(['scripts/*', 'txt/**/*.md', 'book.json'], ['construir_gitbook']); 
// });